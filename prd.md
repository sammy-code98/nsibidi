# Nsibidi — Frontend Engineer Technical Assessment PRD

## 1. Product Overview

### Product Name

**Nsibidi — Async Job Processing Interface**

### Project Type

Frontend technical assessment demonstrating the implementation of a production-style asynchronous job workflow.

### Objective

Build a React + TypeScript web application that allows users to:

1. Upload an image.
2. Submit the image as a processing job.
3. Receive confirmation that the job has been queued.
4. Monitor the job's status in real time.
5. Review the processed result when the job completes.
6. Understand and recover from submission or processing failures.
7. Retry or resubmit failed jobs.

The application will communicate with a **mocked API** implementing the API contract provided in the assessment. No real backend infrastructure is required.

---

# 2. Assessment Context

The assessment describes an interface pattern used by AI-generation products:

> Submit a job → poll for status → review the result.

This pattern is representative of longer-running operations such as image upscaling, image coloring, and keyframe-to-video generation.

The implementation should therefore feel like a small but realistic production application rather than a static UI mockup.

The primary engineering goal is to demonstrate reliable handling of asynchronous application state.

---

# 3. Goals

## Primary Goals

### G1 — Reliable Job Submission

Allow users to select a valid image and submit it as a processing job.

### G2 — Realistic Async Processing

Represent the complete lifecycle of a job:

```text
Idle
  ↓
File Selected
  ↓
Submitting
  ↓
Queued
  ↓
Processing
  ↓
Complete
  ↓
Result Available
```

And support failure states:

```text
Submitting
    ↓
Submission Failed

Queued
   ↓
Processing
   ↓
Job Failed
```

### G3 — Live Status Monitoring

The user should not need to manually refresh the browser to see changes in job state. The frontend should periodically poll the mocked API.

### G4 — Multiple Jobs

If multiple jobs are submitted, all active jobs should remain visible rather than replacing the previous job with the newest one.

### G5 — Clear Result Review

Completed jobs should expose their processed result clearly.

### G6 — Actionable Error Recovery

Failures should provide useful information and a clear recovery action rather than displaying a generic error message.

### G7 — Clean Frontend Architecture

The application should demonstrate:

* Separation of concerns.
* Strong TypeScript typing.
* Predictable async state management.
* Reusable components.
* API abstraction.
* Testable business logic.
* Clear error handling.

These areas directly align with what the assessment says reviewers will evaluate.

---

# 4. Non-Goals

The following should explicitly remain outside the scope:

* Real backend implementation.
* Authentication.
* User accounts.
* Database persistence.
* Production cloud infrastructure.
* Payment functionality.
* Complex design system development.
* Advanced animations.
* Real AI/image processing.
* Backend deployment.

The assessment explicitly states that backend implementation, authentication, and extensive visual/design-system work are not being evaluated.

---

# 5. Target User

The primary user is a person who wants to submit an image for asynchronous processing and monitor the operation until a result becomes available.

The interface should assume the user:

* May not understand technical API terminology.
* Should not need to understand polling.
* Needs confidence that their job was successfully submitted.
* Needs visibility into what is happening.
* Needs to understand when processing has failed.
* Needs a straightforward way to recover.

---

# 6. Core User Journey

## Happy Path

```text
Landing / Upload
       ↓
Select Image
       ↓
Validate File
       ↓
Submit
       ↓
Job Queued
       ↓
Status Monitor
       ↓
Processing
       ↓
Complete
       ↓
Result Review
```

## Submission Failure

```text
Upload
  ↓
Submit
  ↓
API/Network Failure
  ↓
Error Message
  ↓
Retry Submission
```

## Processing Failure

```text
Upload
  ↓
Submit
  ↓
Queued
  ↓
Processing
  ↓
Failed
  ↓
Actionable Error
  ↓
Retry / Resubmit
```

## Long-Running Job

```text
Queued
  ↓
Processing
  ↓
Processing for extended period
  ↓
"Taking longer than expected"
  ↓
Continue monitoring
```

The assessment specifically requires handling jobs that take a long time or appear stuck.

---

# 7. Application Structure

The application should use a simple three-stage experience.

## Screen 1 — Submit Job

Purpose:

Allow the user to select an image and submit a processing job.

### UI Sections

#### Header

Contains:

* Application name/logo.
* Short description.
* Optional job counter.

Example:

**Nsibidi**

"Upload an image and we'll process it for you."

---

#### Upload Card

Large HeroUI Card containing:

* Drag-and-drop zone.
* Browse button.
* Upload icon.
* Supported file types.
* Maximum file size.
* Empty state.

Example:

```text
┌─────────────────────────────────────────┐
│                                         │
│               Upload Image              │
│                                         │
│        Drag & drop your image here      │
│                  or                     │
│             [ Browse Files ]            │
│                                         │
│       PNG, JPG, JPEG • Max 10MB         │
│                                         │
└─────────────────────────────────────────┘
```

The exact accepted file formats and limits should be defined in the implementation and consistently reflected in validation and UI.

---

#### Selected File State

After selecting an image, display:

* Image thumbnail.
* Filename.
* File size.
* File type.
* Remove button.
* Submit button.

Example:

```text
┌─────────────────────────────────────────┐
│  [IMAGE]  example-image.jpg             │
│           2.4 MB • JPEG                 │
│                                         │
│           [ Remove ]                    │
└─────────────────────────────────────────┘

              [ Process Image ]
```

---

## 8. Submission Rules

The submit action must remain disabled until a valid file is selected.

This is explicitly required by the assessment.

### Validation

Validate:

* File exists.
* File type is supported.
* File size is within the configured limit.

### Invalid File

Display an inline validation message.

Example:

**Unsupported file type**

"Please select a PNG, JPG, or JPEG image."

The user should be able to select another file immediately.

---

# 9. Submission Loading State

When the user clicks **Process Image**:

1. Disable the submit button.
2. Display a loading indicator.
3. Prevent duplicate submissions.
4. Call `POST /jobs`.
5. Store the returned `job_id`.
6. Add the job to the job list.
7. Transition to the status monitor.

The API immediately returns:

```json
{
  "job_id": "abc123",
  "status": "queued"
}
```

---

# 10. Job Confirmation

After successful submission, communicate clearly that the job has been queued.

Example:

**Your image has been queued**

"Processing has started. You can monitor its progress below."

The user should never have to guess whether the submission worked.

---

# 11. Screen 2 — Live Status Monitor

The status screen is the central feature of the application.

It should display every submitted job currently being tracked.

The assessment explicitly requires support for multiple jobs in flight.

---

# 12. Job List

Each job should be represented by a reusable `JobCard` component.

### Job Card

Each card should contain:

* Image thumbnail.
* Job ID or shortened identifier.
* Filename.
* Current status.
* Status description.
* Created/submitted time.
* Progress indicator where appropriate.
* Relevant action.

Example:

```text
┌────────────────────────────────────────────┐
│ [IMG]  landscape.jpg                      │
│       Job #abc123                         │
│                                           │
│       ● Processing                        │
│       Your image is currently being       │
│       processed.                          │
│                                           │
│       [████████░░░░]                      │
│                                           │
│       Updated a few seconds ago           │
└────────────────────────────────────────────┘
```

---

# 13. Human-Readable Statuses

The UI must never expose raw API values such as:

```text
queued
processing
complete
failed
```

Instead, map them to user-friendly labels:

| API Status   | UI Label   | Description                              |
| ------------ | ---------- | ---------------------------------------- |
| `queued`     | Queued     | Your job is waiting to be processed.     |
| `processing` | Processing | Your image is currently being processed. |
| `complete`   | Complete   | Your image has finished processing.      |
| `failed`     | Failed     | The image could not be processed.        |

This requirement is explicitly called out in the assessment.

---

# 14. Polling Strategy

The frontend should poll:

```http
GET /jobs/{job_id}
```

The response contains:

```json
{
  "job_id": "abc123",
  "status": "queued",
  "result": null,
  "error": null
}
```

### Recommended Strategy

Use a polling interval such as:

```text
Every 2–3 seconds
```

for jobs in:

* `queued`
* `processing`

Stop polling when the job becomes:

* `complete`
* `failed`

### Important

Polling must be cleaned up when:

* The job completes.
* The job fails.
* The component unmounts.
* The job is removed from tracking.

This prevents unnecessary network requests and memory leaks.

---

# 15. Long-Running Job UX

The assessment specifically requires handling jobs that take a long time or appear stuck.

After a configurable amount of time, the UI should communicate this without incorrectly claiming that the job failed.

Example:

**Still processing**

"This is taking longer than expected, but your job is still active."

Actions:

* Continue waiting.
* View other jobs.

Do not automatically mark the job as failed simply because processing takes longer than expected.

---

# 16. Screen 3 — Output Review

When a job reaches `complete`, the user should be able to review the result.

The API provides:

```http
GET /jobs/{job_id}/result
```

If the job is complete, the endpoint returns the processed result. If it isn't complete, the API returns an error.

---

# 17. Result View

The result screen/card should include:

* Processed image.
* Original image where useful.
* Job information.
* Completion status.
* Result action.

Suggested layout:

```text
┌────────────────────────────────────────────┐
│              Processing Complete           │
│                                            │
│        ┌──────────────────────┐            │
│        │                      │            │
│        │    RESULT IMAGE      │            │
│        │                      │            │
│        └──────────────────────┘            │
│                                            │
│              [ View Result ]               │
│                                            │
└────────────────────────────────────────────┘
```

The result should be visually prominent and easy to understand.

---

# 18. Failed Job Experience

A failed job must not simply show:

> Something went wrong.

The assessment specifically requires a **specific, actionable error**.

Example:

**Processing failed**

"We couldn't process this image because the processing service rejected the file."

Actions:

* Retry.
* Resubmit image.
* Return to upload.

---

# 19. Retry Flow

A failed job should provide a clear recovery mechanism.

### Retry

Clicking **Retry** should:

1. Preserve the original file if available.
2. Create a new job.
3. Add the new job to the job list.
4. Start polling the new job.
5. Keep the failed job visible as historical context if appropriate.

Avoid silently mutating the old job's state.

This keeps the state model predictable.

---

# 20. Mock API

The application must implement the supplied API contract locally.

Recommended implementation:

**MSW — Mock Service Worker**

Alternative:

* Local mock service.
* Fetch interception.
* In-memory API abstraction.

MSW is recommended because it allows the application to interact with an API-like interface without coupling UI code to mock-specific logic.

---

# 21. API Contract

## Create Job

```http
POST /jobs
```

### Request

Multipart/form-data containing:

```text
file: Image
```

### Response

```json
{
  "job_id": "abc123",
  "status": "queued"
}
```

---

## Get Job Status

```http
GET /jobs/{job_id}
```

### Response

```json
{
  "job_id": "abc123",
  "status": "queued | processing | complete | failed",
  "result": null,
  "error": null
}
```

---

## Get Result

```http
GET /jobs/{job_id}/result
```

### Complete

Return the processed result.

### Incomplete

Return a clear error.

The API contract is provided directly by the assessment and should be preserved rather than replaced with a different application architecture.

---

# 22. Realistic Mock Behavior

The mock API must not instantly complete every job.

The assessment specifically asks for:

* Realistic timing.
* Occasional failures.

Recommended simulation:

```text
POST /jobs
    ↓
queued
    ↓ 2–4 seconds
processing
    ↓ 5–12 seconds
complete
```

Occasionally:

```text
queued
    ↓
processing
    ↓
failed
```

The delay should be deterministic enough for development but varied enough to demonstrate asynchronous behavior.

---

# 23. Application State Model

The frontend should treat each job as an independent asynchronous state machine.

```ts
type JobStatus =
  | 'queued'
  | 'processing'
  | 'complete'
  | 'failed';
```

Suggested frontend job model:

```ts
interface Job {
  id: string;
  filename: string;
  file?: File;
  status: JobStatus;
  result?: string | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

The API response types should remain separate from UI/domain models where appropriate.

---

# 24. Recommended Architecture

```text
src/
├── app/
│   ├── App.tsx
│   └── routes.tsx
│
├── components/
│   ├── upload/
│   │   ├── FileDropzone.tsx
│   │   ├── FilePreview.tsx
│   │   └── UploadCard.tsx
│   │
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   ├── JobStatus.tsx
│   │   ├── JobProgress.tsx
│   │   └── JobError.tsx
│   │
│   └── results/
│       ├── ResultCard.tsx
│       └── ResultViewer.tsx
│
├── features/
│   └── jobs/
│       ├── hooks/
│       │   ├── useCreateJob.ts
│       │   ├── useJobStatus.ts
│       │   └── useJobResult.ts
│       │
│       ├── job.types.ts
│       ├── job.utils.ts
│       └── job.service.ts
│
├── api/
│   ├── client.ts
│   └── jobs.ts
│
├── mocks/
│   ├── handlers.ts
│   ├── server.ts
│   └── data.ts
│
├── pages/
│   ├── UploadPage.tsx
│   ├── JobsPage.tsx
│   └── ResultPage.tsx
│
└── lib/
    ├── validation.ts
    └── utils.ts
```

The exact directory structure can vary, but responsibilities should remain separated.

---

# 25. HeroUI Component Strategy

HeroUI should be the primary UI component library.

The objective is to use HeroUI for reusable interface primitives while keeping application-specific components separate.

## Recommended HeroUI Components

### Layout

* `Card`
* `Divider`
* `Spacer`

### Actions

* `Button`

### Feedback

* `Spinner`
* `Progress`
* `Chip`

### Forms

* `Input`
* `Button`

### Status

* `Chip`
* `Progress`
* `Spinner`

### Overlays

Use HeroUI `Modal` only where it genuinely improves the workflow, such as viewing a larger processed result.

---

# 26. Component Design

## `FileDropzone`

Responsibilities:

* Handle drag/drop.
* Open file browser.
* Validate selected files.
* Display empty state.
* Emit valid file to parent.

Should not know anything about job submission.

---

## `FilePreview`

Responsibilities:

* Display selected image.
* Display filename.
* Display metadata.
* Remove selected file.

---

## `UploadCard`

Responsibilities:

* Compose dropzone and file preview.
* Manage upload screen presentation.
* Trigger submission callback.

---

## `JobCard`

Responsibilities:

* Display individual job state.
* Render correct status UI.
* Display relevant actions.
* Provide access to completed results.

---

## `JobStatus`

Responsibilities:

Convert technical API status into user-friendly UI.

Example:

```ts
const statusConfig = {
  queued: {
    label: 'Queued',
    description: 'Your job is waiting to be processed.',
  },
  processing: {
    label: 'Processing',
    description: 'Your image is currently being processed.',
  },
  complete: {
    label: 'Complete',
    description: 'Your image has finished processing.',
  },
  failed: {
    label: 'Failed',
    description: 'We could not process your image.',
  },
};
```

---

## `JobList`

Responsibilities:

* Render all active jobs.
* Handle empty state.
* Maintain stable ordering.
* Render multiple jobs independently.

---

## `ResultViewer`

Responsibilities:

* Display completed result.
* Provide a clear review experience.
* Handle result loading.
* Handle result retrieval errors.

---

# 27. State Management

The assessment is primarily evaluating asynchronous state management, so the implementation should avoid putting all logic into a single page component.

Recommended state separation:

### UI State

Examples:

```text
selectedFile
isUploadDialogOpen
isResultModalOpen
```

### Job State

Examples:

```text
jobs[]
job.status
job.result
job.error
```

### Request State

Examples:

```text
isSubmitting
isFetchingResult
```

The job state should be independent for each job.

---

# 28. Async State Requirements

Every async operation should have explicit:

```text
Loading
Success
Error
```

states.

### Create Job

```text
idle
→ submitting
→ success
→ error
```

### Poll Job

```text
polling
→ updated
→ complete
→ failed
```

### Fetch Result

```text
loading
→ success
→ error
```

Avoid ambiguous boolean state such as:

```ts
loading = true
```

without knowing which operation is loading.

Prefer state that describes the operation being performed.

---

# 29. Error Handling Matrix

| Scenario                   | UI Behavior                           |
| -------------------------- | ------------------------------------- |
| Invalid file               | Inline validation                     |
| Unsupported format         | Validation error                      |
| Submission network failure | Error alert + retry                   |
| Submission API failure     | Actionable error + retry              |
| Job processing failure     | Failed state + explanation            |
| Result requested too early | Inform user result isn't ready        |
| Result fetch failure       | Error state + retry                   |
| Long-running job           | "Taking longer than expected" message |
| Multiple jobs              | Display every tracked job             |

This directly covers the edge cases required by the assessment.

---

# 30. Empty States

The application should handle an empty job list gracefully.

Example:

**No jobs yet**

"Upload an image to create your first processing job."

Primary action:

**Upload Image**

---

# 31. Loading States

Avoid blank screens during asynchronous operations.

Use HeroUI components such as:

* `Spinner`
* `Progress`

Examples:

### Upload

**Submitting your image…**

### Processing

**Processing your image…**

### Result

**Preparing your result…**

---

# 32. Accessibility

The implementation should include basic production-level accessibility.

Requirements:

* Keyboard-accessible upload interaction.
* Proper button labels.
* Accessible form controls.
* Visible focus states.
* Meaningful status text.
* Appropriate `alt` attributes.
* Do not rely exclusively on color to communicate status.
* Errors should be readable by assistive technologies.

---

# 33. Responsive Design

The interface should work across:

* Desktop.
* Tablet.
* Mobile.

### Desktop

Two-column or centered layout where appropriate.

### Mobile

Single-column layout.

Job cards should stack naturally and remain readable without horizontal scrolling.

---

# 34. Visual Direction

Although the assessment explicitly states that visual polish is not the primary evaluation area, the application should still feel coherent and usable.

Recommended design direction:

* Minimal.
* Modern.
* Clean.
* Content-focused.
* Strong typography.
* Generous spacing.
* Subtle borders.
* Rounded HeroUI cards.
* Clear status hierarchy.

Avoid spending excessive assessment time creating an elaborate design system.

The goal is:

**Clean and professional > visually ambitious.**

---

# 35. Status Visual Language

Use consistent status treatments.

### Queued

Neutral/informational presentation.

### Processing

Active progress presentation.

### Complete

Positive/success presentation.

### Failed

Error presentation.

HeroUI `Chip` can provide a concise status indicator while the surrounding text explains the state in plain language.

---

# 36. Multi-Job Behavior

Example:

```text
Jobs

┌────────────────────────────────────┐
│ image-01.jpg                       │
│ Processing                         │
│ ████████░░░                        │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ image-02.jpg                       │
│ Queued                             │
│ Waiting to start                   │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ image-03.jpg                       │
│ Complete                           │
│ [View Result]                      │
└────────────────────────────────────┘
```

Each job should have independent polling and lifecycle handling.

---

# 37. Routing

A simple routing structure can be used:

```text
/
└── Upload

/jobs
└── Job Monitor

/jobs/:jobId
└── Job Details / Result
```

However, routing should not become unnecessarily complex.

A single-page workflow with sections/views is also acceptable if the implementation remains clear.

The assessment does not prescribe routing.

---

# 38. Data Flow

Recommended data flow:

```text
User
 ↓
FileDropzone
 ↓
UploadCard
 ↓
Create Job Hook
 ↓
Job API Service
 ↓
Mock API
 ↓
Job Store / State
 ↓
JobList
 ↓
JobCard
 ↓
Polling Hook
 ↓
Job API
 ↓
Updated Job State
 ↓
ResultViewer
```

This keeps API concerns away from presentation components.

---

# 39. API Service Layer

Avoid making raw `fetch()` calls directly inside UI components.

Example conceptual API interface:

```ts
jobsApi.create(file)
jobsApi.getStatus(jobId)
jobsApi.getResult(jobId)
```

Components should interact with hooks/services rather than knowing the underlying HTTP implementation.

---

# 40. Mock API State

The mock API should maintain an in-memory representation of jobs.

Example:

```ts
interface MockJob {
  jobId: string;
  status: JobStatus;
  file: File;
  result: string | null;
  error: string | null;
  createdAt: number;
}
```

Each mock job can progress through a simulated lifecycle.

---

# 41. Mock Failure Simulation

The mock server should occasionally fail jobs.

For example:

```text
90% → Complete
10% → Failed
```

The exact percentage is not important.

What matters is that failure is realistic and reproducible enough to test the UI.

---

# 42. Testing Strategy

The assessment does not explicitly mandate a testing framework, but tests would strengthen the implementation.

Prioritize tests around business-critical behavior.

### File Validation

Test:

* Valid image accepted.
* Invalid extension rejected.
* Oversized file rejected.

### Job Submission

Test:

* Valid file triggers API request.
* Submission error is handled.
* Duplicate submission is prevented.

### Polling

Test:

* Queued job continues polling.
* Processing job continues polling.
* Complete job stops polling.
* Failed job stops polling.

### Result

Test:

* Complete job retrieves result.
* Incomplete job cannot retrieve result.
* Result failure displays an error.

---

# 43. Performance Considerations

Keep implementation intentionally lightweight.

Consider:

* Object URL cleanup for image previews.
* Polling cleanup.
* Avoid unnecessary re-renders.
* Stable job keys.
* Avoid polling completed/failed jobs.
* Lazy-load large result images where appropriate.

Do not prematurely optimize areas that do not matter for the assessment.

---

# 44. Security / File Handling

Even though there is no real backend, the frontend should behave responsibly.

Do not assume:

```text
file.type === valid
```

is sufficient for server-side validation.

The mock frontend can validate the file for UX purposes, while the architecture should acknowledge that real applications must validate uploads server-side.

---

# 45. Suggested Tech Stack

## Required

* React
* TypeScript

These are explicitly required by the assessment.

## UI

* HeroUI
* Tailwind CSS

## API Mocking

Recommended:

* MSW

## Routing

Recommended:

* React Router

## State / Server State

Recommended:

* TanStack Query

TanStack Query is particularly suitable for:

* Mutations.
* Polling.
* Request caching.
* Async status.
* Error handling.

However, the implementation should avoid adding unnecessary dependencies solely for the sake of the assessment.

---

# 46. Recommended Technical Stack

```text
React
TypeScript
Vite
React Router
HeroUI
Tailwind CSS
TanStack Query
MSW
```

This stack keeps the application focused on frontend engineering while providing good primitives for asynchronous state.

---

# 47. Why HeroUI

HeroUI should be documented in the README as the selected component library.

Reasons:

1. Provides accessible, reusable components.
2. Works naturally with React and Tailwind.
3. Allows fast implementation without building a custom design system.
4. Provides useful components for this assessment such as:

   * Button
   * Card
   * Chip
   * Spinner
   * Progress
   * Modal
5. Allows the developer to focus assessment time on async state management rather than recreating basic UI primitives.

The assessment explicitly allows the candidate to choose their UI library and asks them to explain the choice in the README.

---

# 48. Definition of Done

## Submission

* [ ] User can drag and drop an image.
* [ ] User can browse and select an image.
* [ ] Accepted formats are clearly displayed.
* [ ] Invalid files are rejected.
* [ ] Submit button remains disabled until a valid file exists.
* [ ] Duplicate submissions are prevented.

## Job Processing

* [ ] Successful submission creates a job.
* [ ] User sees confirmation that the job was queued.
* [ ] Job status updates without manual refresh.
* [ ] Queued state is displayed.
* [ ] Processing state is displayed.
* [ ] Complete state is displayed.
* [ ] Failed state is displayed.
* [ ] Multiple jobs can be tracked simultaneously.
* [ ] Completed and failed jobs stop polling.

## Result

* [ ] Completed result is displayed clearly.
* [ ] Result loading state exists.
* [ ] Result retrieval errors are handled.
* [ ] User can review the result.

## Failure Recovery

* [ ] Submission errors are handled.
* [ ] Processing failures are handled.
* [ ] Errors are specific and actionable.
* [ ] Failed jobs can be retried/resubmitted.
* [ ] Long-running jobs receive appropriate UX treatment.

## Technical Quality

* [ ] React + TypeScript.
* [ ] Mock API implemented.
* [ ] API contract preserved.
* [ ] Components are reusable.
* [ ] Async logic is separated from presentation.
* [ ] Strong TypeScript types.
* [ ] Polling is cleaned up.
* [ ] No unnecessary duplicated logic.
* [ ] README documents architecture decisions.

---

# 49. README Requirements

The final repository should contain a `README.md`.

It should include:

## Project Overview

Brief explanation of Nsibidi.

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

Explain:

* React
* TypeScript
* HeroUI
* Tailwind
* TanStack Query
* MSW

## Architecture

Explain:

* Component organization.
* API service layer.
* Async state management.
* Mock API architecture.

## Async State Strategy

Explain:

* How jobs are represented.
* How polling works.
* When polling starts.
* When polling stops.
* How multiple jobs are handled.
* How failures are represented.

## Mock API

Explain:

* How `/jobs` is mocked.
* How job status changes.
* How delays are simulated.
* How failures are simulated.

## UI Library Decision

Explain why HeroUI was selected.

## Tradeoffs

Document what was intentionally kept simple.

The assessment explicitly requests architecture decisions, async-state reasoning, API mocking approach, and what would be done differently with more time.

---

# 50. Implementation Priorities

Given the assessment's estimated **6–10 hour timeframe**, implementation should be prioritized.

## Priority 1 — Must Have

```text
File upload
↓
Submit job
↓
Mock API
↓
Polling
↓
Status UI
↓
Result
↓
Failure handling
↓
Retry
```

## Priority 2 — Engineering Quality

```text
TypeScript
Component separation
API abstraction
Polling cleanup
Reusable components
Error handling
Responsive UI
```

## Priority 3 — Polish

```text
Animations
Transitions
Empty states
Micro-interactions
Additional responsive refinements
```

Do not sacrifice core async functionality for visual polish.

The assessment explicitly states that a simple, clean implementation is preferable to an ambitious implementation with rough edges.

---

# 51. Suggested 6–10 Hour Implementation Plan

## Hour 1 — Project Setup

* Initialize React + TypeScript.
* Configure Tailwind.
* Install HeroUI.
* Configure routing.
* Establish project structure.

## Hour 2 — Upload Experience

* File dropzone.
* File validation.
* Preview.
* Submit state.
* Error states.

## Hour 3 — Mock API

* Implement `POST /jobs`.
* Implement `GET /jobs/:jobId`.
* Implement `GET /jobs/:jobId/result`.
* Add realistic delays.
* Add occasional failures.

## Hours 4–5 — Async Job State

* Job model.
* Create-job mutation.
* Polling.
* Multiple jobs.
* Status mapping.
* Cleanup.

## Hour 6 — Result & Failure

* Result view.
* Failed state.
* Retry.
* Long-running state.

## Hour 7 — UX Refinement

* Empty states.
* Loading states.
* Responsive layout.
* Accessibility.
* Error messaging.

## Hour 8 — Testing / QA

Test:

* Valid upload.
* Invalid upload.
* Submission failure.
* Queue.
* Processing.
* Completion.
* Failure.
* Retry.
* Multiple jobs.
* Long-running job.

## Hours 9–10 — README & Polish

* Architecture documentation.
* HeroUI decision.
* Async state explanation.
* Mock API explanation.
* Tradeoffs.
* Final cleanup.
* GitHub preparation.

---

# 52. Final Product Experience

The finished application should communicate a simple story:

### Step 1

**Upload your image**

↓

### Step 2

**Your job has been queued**

↓

### Step 3

**We're processing your image**

↓

### Step 4

**Your result is ready**

↓

### Step 5

**Review your result**

And when something goes wrong:

**We couldn't process your image → Here's why → Retry**

That workflow is the heart of the assessment.

---

# 53. Success Criteria

The implementation should be considered successful when a reviewer can:

1. Upload an image without confusion.
2. Clearly understand whether the submission succeeded.
3. Watch a job transition through its lifecycle without refreshing.
4. Submit multiple jobs and monitor them independently.
5. Understand exactly what each status means.
6. See the processed result after completion.
7. Understand why a job failed.
8. Recover from a failed job.
9. Observe realistic asynchronous behavior.
10. Inspect the code and understand how async state is separated from UI.

The implementation should ultimately demonstrate that the developer can build **reliable frontend experiences around asynchronous APIs**, which is the central purpose of the assessment.
