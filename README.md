# Nsibidi

Async image processing made simple.

Nsibidi is a frontend for an image-processing service where work happens in the
background. You pick an image, submit it, and get an immediate confirmation that
the job is queued — not a spinner that blocks the page. From there the job moves
through its lifecycle on its own, the interface keeps up without a refresh, and
you can carry on submitting more work while earlier jobs are still running.

The entire backend is mocked in the browser. There is no server to run.

---

## Features

- **Image upload** — drag and drop or click to browse, with a preview showing
  the thumbnail, filename, type and size.
- **Validation before submission** — PNG, JPG and JPEG up to 10 MB. Rejections
  name the file and say what to do instead.
- **Job submission** — the submit button stays disabled until a valid file is
  staged, and a fast double-click cannot create two jobs.
- **Genuinely asynchronous processing** — jobs are `queued` on acceptance and
  only reach a terminal state after real elapsed time.
- **Live status** — statuses update on their own; nothing needs refreshing.
- **Multiple concurrent jobs** — each job has its own request, cache entry and
  error state, so one can be processing while another has failed and a third has
  completed.
- **Result review** — the processed image with its completion time and duration.
- **Failure handling** — submission failures, processing failures and result
  retrieval failures are each explained differently, with an action attached.
- **Retry** — a failed job can be resubmitted, which creates a **new** job and
  leaves the failed one in the list.
- **Long-running jobs** — after 20 seconds a job says so, without being marked
  as failed and without polling stopping.

---

## Tech stack

| Tool | Why |
| --- | --- |
| **React 19** + **TypeScript** (strict) | Required by the assessment; strict mode is on, with `noUncheckedIndexedAccess`. |
| **Vite 8** | Dev server and build. |
| **HeroUI 3** | UI component library — see [HeroUI decision](#heroui-decision). |
| **Tailwind CSS 4** | Layout and spacing around HeroUI's components. |
| **TanStack Query 5** | Owns all server-derived state: polling, caching, request/error state. |
| **React Router 7** | Three routes plus a not-found route. |
| **MSW 2** | Implements the API contract as a service worker, so the app makes real HTTP requests. |
| **Vitest** + Testing Library | 36 tests over validation, the job lifecycle, polling and retry. |
| **oxlint** | Linting (what `create-vite` now scaffolds in place of ESLint). |

---

## Running locally

Requires **Node 20.19+**.

```bash
npm install
npm run dev          # http://localhost:5173
```

Other commands:

```bash
npm run build        # type-check (tsc -b) and build for production
npm run preview      # serve the production build
npm run lint         # oxlint
npm test             # run the test suite once
npm run test:watch   # re-run tests on change
```

The mock service worker (`public/mockServiceWorker.js`) is committed, so there is
no extra setup step. It runs in the production build too — `npm run build &&
npm run preview` is fully functional.

---

## Architecture

```text
  UI components          components/upload, components/jobs, components/results
        │                 render state; they never fetch
        ▼
  Hooks                  features/jobs/hooks
        │                 own async state — mutations, polling, caching
        ▼
  API service            api/jobs.ts   — the endpoint contract
        │                api/client.ts — the only place fetch() is called
        ▼
  Mock API               mocks/handlers.ts, mocks/data.ts
                          simulated timings and failures
```

```text
src/
├── api/            client.ts (fetch + ApiError), jobs.ts (the contract)
├── app/            App.tsx, routes.tsx, queryClient.ts
├── components/
│   ├── jobs/       JobCard, JobList, JobStatus, JobProgress, JobError,
│   │               JobFailurePanel, JobLongRunningNotice
│   ├── layout/     AppLayout, AppHeader, PageHeading
│   ├── results/    ResultCard, ResultViewer
│   ├── ui/         EmptyState, ErrorAlert, LinkButton
│   └── upload/     FileDropzone, FilePreview, UploadCard
├── features/
│   ├── jobs/       hooks/ (useCreateJob, useJobStatus, useJobResult,
│   │               useRetryJob, useIsJobLongRunning), job.types, job.status,
│   │               job.errors, job.keys, job.config, job.utils, JobsProvider
│   └── upload/     useFileSelection
├── hooks/          useObjectUrl
├── lib/            validation.ts, format.ts, constants.ts
├── mocks/          handlers.ts, data.ts, config.ts, browser.ts, server.ts
├── pages/          UploadPage, JobsPage, JobDetailsPage, NotFoundPage
└── test/           setup.ts, utils.tsx
```

The boundary that matters: **no component calls `fetch`, and no hook knows what
an endpoint looks like.** `fetch` appears exactly once in the codebase, in
`api/client.ts`.

### Where a job's state lives

This is the one design decision everything else follows from. A job has two
kinds of state, and they are kept apart:

- **What the service knows** — status, result, error. This lives in the
  TanStack Query cache, one entry per job under `['jobs', jobId]`.
- **What only the client knows** — the original filename, the `File` itself (so
  a failed job can be resubmitted), and when it was submitted. This lives in a
  small React context, `JobsProvider`.

Status is deliberately **not** duplicated into the context. If it were, there
would be two answers to "what is this job doing?" and they could disagree. The
registry only tracks *which* jobs exist; the cache is the sole authority on what
each one is doing.

---

## Async state management

### Why TanStack Query

The hard parts here are all server-state problems: something must poll, know
when to stop, cache a result that will never change, and keep several jobs from
sharing a loading flag. TanStack Query does those directly:

- **One query per job.** `useJobStatus(jobId)` is scoped to a single job, so
  each has its own request, cache entry, loading state and error. There is no
  global `isLoading` that could ever exist — a job that fails cannot affect how
  another renders.
- **Polling is a property of the query, not a timer in a component.** Query
  starts the interval when the first observer mounts and clears it when the last
  unmounts, so a card scrolling out of existence cannot leave a request loop
  behind.
- **Mutations** carry submission state and errors without hand-rolled flags.

### How polling works, and how it stops

`useJobStatus` re-checks an unsettled job every **2.5 seconds** via
`refetchInterval`, which returns `false` — permanently ending the interval — in
two cases:

1. **The job reached `complete` or `failed`.** Terminal means terminal; nothing
   further can change.
2. **The query errored with no data at all.** A job the service cannot describe
   (an unknown id, say) would otherwise be re-requested forever. The card offers
   a **Check again** button instead, and a successful retry resumes polling.

The second condition uses `state.status === 'error'`, not `fetchFailureCount` —
that counter is reset at the start of every fetch, so it only counts retries
*within* one fetch and never accumulates across poll cycles. Using
`state.status` also gives the right behaviour for a transient blip: a background
refetch that fails while data already exists leaves the status as `success`, so
a job already being tracked keeps polling rather than giving up.

**The app contains no `setInterval` anywhere.** The single `setTimeout` is in
`useIsJobLongRunning`, which fires once at the 20-second mark and is cleared on
unmount.

### Immediate feedback

When the service accepts a job, the mutation writes `status: 'queued'` straight
into the cache under that job's key. The job therefore reads "Queued" the moment
it appears, rather than showing an empty state until the first poll lands.

### How failures are represented

Three different things can go wrong, and they get three different explanations —
because telling a user their image failed when the *result fetch* failed would be
wrong:

| What broke | Wording | Recovery |
| --- | --- | --- |
| The submission | "We couldn't submit your image" | Try again |
| The job itself | "Processing failed" + the service's reason | Retry job / Upload another |
| The status check | "We couldn't check on this job" | Check again |
| The result fetch | "We couldn't load your result" — *your job finished, but…* | Try again |

Each is derived from the HTTP status by a describer in `job.errors.ts`, so
offline, 404, 409, 413 and 5xx each produce distinct copy. None of them can
produce a bare "Something went wrong" — a test asserts that across all three
describers and six error kinds.

### Retry creates a new job

Retrying resubmits the stored `File` and tracks the result as a **new** job. The
failed job stays exactly as it was. Flipping it back to `queued` would be
simpler, but it would erase the fact that an attempt genuinely failed:

```text
Job A (failed)  ──retry──▶  Job B (queued → processing → …)
   still listed as failed
```

---

## Mock API

Implemented with MSW in `src/mocks/`. The same handlers back both the browser
worker (`browser.ts`) and the test server (`server.ts`), so tests exercise the
service the app actually talks to.

### Endpoints

| Method | Path | Behaviour |
| --- | --- | --- |
| `POST` | `/jobs` | Accepts multipart `file`. Returns `202` with `{ job_id, status: "queued" }` immediately. |
| `GET` | `/jobs/:jobId` | `{ job_id, status, result, error }`. `404` if unknown. |
| `GET` | `/jobs/:jobId/result` | `200` once complete. `409` while still running, with different copy again if the job failed. `404` if unknown. |
| `GET` | `/jobs/:jobId/image` | The processed image bytes. `409` before completion. |

The result endpoint returns a *URL* rather than inline image data, which is both
closer to how a real service behaves and avoids pushing megabytes of base64
through the service-worker boundary.

### Simulated timing

Nothing resolves instantly. Every response carries **120–400 ms** of latency, and
a job's lifecycle runs on the clock:

```text
POST /jobs  →  queued  ──2–4s──▶  processing  ──5–12s──▶  complete | failed
                                  (slow jobs: 32–45s)
```

By default **25%** of jobs fail and **15%** are slow.

Status is **derived from elapsed time on read**, not driven by timers that mutate
state. No timer can leak, progress stays correct when a backgrounded tab has its
timers throttled, and the lifecycle is testable by advancing the clock instead of
waiting a minute.

### Forcing a specific outcome

Random failures make the failure paths awkward to review, so **the filename
decides the behaviour**. Any name containing:

| Keyword | Outcome |
| --- | --- |
| `success`, `succeed` | Completes normally with a viewable result |
| `fail`, `broken`, `corrupt` | Accepted, then fails during processing |
| `slow`, `huge`, `large` | Takes 32–45s, exercising the long-running notice |
| `reject`, `offline`, `unavailable` | Submission itself is refused (`503`) |
| `noresult`, `missing` | Completes, but the result cannot be retrieved |

So `broken-scan.png` always fails and `success-photo.png` always works. Anything
else follows the probabilities above. Forced scenarios also run at normal speed,
so a file named to demonstrate a failure never randomly takes 45 seconds to get
there.

### What the mock does *not* do

There is no real image processing — the assessment excludes it. The "processed"
result is the image you uploaded, served back. Job state is in-memory in the
page, so **a browser reload clears every job**; see [Tradeoffs](#tradeoffs).

---

## HeroUI decision


## Why I Chose HeroUI v3

I chose **HeroUI v3** as the UI component library for this project because I wanted to spend my time solving the actual problem in the assessment — managing asynchronous job state, handling failures, and building a usable workflow — rather than building basic UI primitives from scratch.

I specifically chose v3 because it is built on top of **React Aria Components**, which gives me a stronger accessibility foundation out of the box. For an application with interactive components such as upload controls, buttons, status indicators, progress states, and result views, I felt this was more valuable than simply choosing a library based on how its components look.

Another reason I chose HeroUI is that it works well with Tailwind CSS. Its semantic design tokens such as `bg-background`, `text-muted`, `border-border`, and `text-danger` allow me to build custom components that still feel consistent with the rest of the application. This means I don't need to maintain a separate set of colors and design rules for components that aren't provided by the library.

I also deliberately chose to use HeroUI as a **primitive layer rather than letting the library dictate the application's architecture**.

HeroUI provides the base components I need:

* `Card`
* `Button`
* `Chip`
* `Spinner`
* `ProgressBar`
* `Alert`
* `Link`

The application-specific behavior is handled by my own components:

* `JobCard`
* `FileDropzone`
* `JobStatus`
* `ResultViewer`
* `JobFailurePanel`

This separation keeps the UI library responsible for reusable interface primitives while keeping the actual business logic and domain-specific UI under my control.

### Working With HeroUI v3

One decision I made early was to build against the actual HeroUI v3 API rather than relying on examples from older versions. HeroUI v3 is a significant change from v2, including compound components such as `Card.Header` and `Card.Title`, as well as changes such as `Divider` becoming `Separator` and `Progress` becoming `ProgressBar`.

Because of those API differences, I verified the shipped type definitions and built the components against the version actually installed in the project. This helped avoid relying on outdated examples or assumptions from the v2 API.

### Decisions Around Links and Navigation

I also ran into an important distinction between buttons and links.

HeroUI's `Button` is a button component and does not take an `href`. For navigation that needs to look like a button, I use HeroUI's `Link` together with `buttonVariants()` to create a `LinkButton`.

I made this choice because it preserves actual anchor semantics rather than turning navigation into a click handler on a button. As a result, normal browser behavior such as opening a link in a new tab or using middle-click is preserved.

For routing, I also connected React Aria's link behavior to React Router through `RouterProvider` in the application layout. This allows HeroUI/React Aria links to participate in client-side navigation instead of triggering full page reloads.

### Overall Decision

Ultimately, I chose HeroUI because it gives me a good balance between **accessibility, reusable primitives, Tailwind integration, and development speed**.

For this assessment, I didn't want the UI library to become the focus of the project. I wanted it to provide a solid foundation while I focused on the areas being evaluated most heavily:

* Async state management.
* Polling.
* Multiple jobs.
* Loading, success, and failure states.
* Retry behavior.
* Component separation.
* Type safety.
* Error handling.

That is why HeroUI is being used as the foundation of the UI, while the application's domain-specific behavior remains implemented within my own components and application architecture.


## Testing

```bash
npm test
```

36 tests across 6 files, aimed at the behaviour most likely to break:

- **File validation** — accepted formats, unsupported types, oversize, a file
  *exactly* at the limit, empty files, and the blank-MIME fallback.
- **Job lifecycle** — `queued → processing → complete` and `queued → processing
  → failed`, plus results refused before completion and jobs staying independent.
- **Polling** — updates with no user action, and requests genuinely **stop** on
  complete, on failed, and on unmount, asserted by counting requests rather than
  trusting the hook.
- **Retry** — a new job is created, the original stays failed *on the service*,
  and no retry is offered when the file is no longer held.
- **Error copy** — every describer × every error kind is asserted to be specific
  and to state a next step.

The polling tests use real timers deliberately. Faking them around Query's
scheduler risks a test passing while the real behaviour is broken, which is
exactly the bug class those tests exist to catch — so the suite takes ~30s.

---

## Tradeoffs

**Kept deliberately simple**

- **Jobs are not persisted across reloads.** They live in memory, and so does the
  mock service — so persisting job ids would only produce requests for jobs the
  service has already forgotten. Persistence was not in the assessment, and
  faking it would have been worse than not having it. The job-details screen
  says so explicitly when it cannot find a job.
- **A React context, not a state-management library.** The registry holds a list
  and one `trackJob` function. Redux or Zustand would be ceremony around ~30
  lines.
- **Progress is indeterminate.** The API reports a *status*, never a percentage.
  A bar creeping toward 100% on a job that then fails would be inventing
  information the app does not have.
- **No real image processing**, per the assessment's exclusions.
- **Swapping a staged file needs *Remove* first.** The dropzone is replaced by
  the preview once a file is chosen. The Remove button sits right beside it, so
  the path is obvious, but a nicer version would let you drop a replacement
  directly.
- **Minimal visual design.** The assessment says polish is not the criterion, so
  the effort went into async state, error handling and accessibility instead.

**What I would do with more time**

- **Cancel a running job.** The contract has no endpoint for it, but it is the
  most obvious missing capability in an async UI.
- **A real progress signal.** If the service reported percent-complete or a
  stage, the indeterminate bar could become informative.
- **Resumable or chunked uploads** for large files, with upload progress —
  currently a 10 MB upload is a single opaque request.
- **Batch submission.** The flow is one image at a time; the job list already
  handles many jobs, so multi-select is mostly upload-side work.
- **Component tests for the layout breakpoints.** Responsive behaviour was
  verified by measuring real layout in headless Chrome during development, but
  that check does not live in the committed suite.
- **Toasts for background transitions**, so a job completing while you are on
  the upload page surfaces without visiting the job list.
