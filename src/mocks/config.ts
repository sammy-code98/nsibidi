/**
 * Timing and failure characteristics of the mock processing service.
 *
 * Kept in one place so the simulated behaviour can be tuned without touching
 * the request handlers.
 */
export const MOCK_CONFIG = {
  /** How long a job waits before it starts processing. */
  queued: { minMs: 2_000, maxMs: 4_000 },

  /** How long a typical job spends processing. */
  processing: { minMs: 5_000, maxMs: 12_000 },

  /**
   * How long an unusually slow job spends processing. Long enough to trip the
   * "still processing" messaging without stalling forever.
   */
  slowProcessing: { minMs: 32_000, maxMs: 45_000 },

  /** Share of jobs that fail during processing. */
  failureRate: 0.25,

  /** Share of jobs that take unusually long to process. */
  slowRate: 0.15,

  /** Latency added to every mock response, so nothing resolves instantly. */
  responseLatency: { minMs: 120, maxMs: 400 },
} as const

/**
 * Filename keywords that force a specific outcome.
 *
 * Random behaviour makes failure and long-running states awkward to review, so
 * naming a file `broken-image.png` or `slow-photo.jpg` triggers that path
 * deliberately. Everything else follows the probabilities above.
 */
export const SCENARIO_KEYWORDS = {
  /** Job is accepted, then fails during processing. */
  fail: ['fail', 'broken', 'corrupt'],
  /** Job takes unusually long, exercising the long-running UX. */
  slow: ['slow', 'huge', 'large'],
  /** Submission itself is rejected by the service. */
  reject: ['reject', 'offline', 'unavailable'],
  /** Job completes, but fetching its result fails. */
  badResult: ['noresult', 'missing'],
} as const

export type ScenarioKind = keyof typeof SCENARIO_KEYWORDS

/** Finds the scenario a filename forces, if any. */
export function detectScenario(filename: string): ScenarioKind | null {
  const name = filename.toLowerCase()

  for (const [kind, keywords] of Object.entries(SCENARIO_KEYWORDS)) {
    if (keywords.some((keyword) => name.includes(keyword))) {
      return kind as ScenarioKind
    }
  }

  return null
}
