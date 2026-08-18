import { ApiError } from '@/api/client'

/**
 * A failure described for a human: what went wrong, and what to do about it.
 */
export interface FailureDescription {
  title: string
  message: string
}

const TRY_AGAIN = 'Please try again.'

/**
 * Turns any thrown value into copy explaining why a submission failed.
 *
 * Deliberately never produces a bare "Something went wrong" — every branch
 * names a likely cause and a next step.
 */
export function describeSubmissionFailure(error: unknown): FailureDescription {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return {
        title: "We couldn't submit your image",
        message:
          'We could not reach the processing service. Check your connection and try again.',
      }
    }

    if (error.status === 413) {
      return {
        title: 'That image was too large to submit',
        message:
          'The service rejected the image for being too large. Try a smaller one.',
      }
    }

    if (error.isServerError) {
      return {
        title: "We couldn't submit your image",
        message: `The processing service is temporarily unavailable. ${TRY_AGAIN}`,
      }
    }

    return {
      title: "We couldn't submit your image",
      message: `The service rejected the upload: ${error.message} ${TRY_AGAIN}`,
    }
  }

  return {
    title: "We couldn't submit your image",
    message: `An unexpected problem stopped the upload before it started. ${TRY_AGAIN}`,
  }
}

/**
 * Turns a failed result request into copy explaining what happened.
 *
 * A completed job whose result will not load is a distinct situation from a
 * job that failed outright, and the wording keeps that distinction — the work
 * succeeded, only the retrieval did not.
 */
export function describeResultFailure(error: unknown): FailureDescription {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return {
        title: "We couldn't load your result",
        message:
          'Your job finished, but we could not reach the service to fetch the result. Check your connection and try again.',
      }
    }

    if (error.status === 404) {
      return {
        title: 'This result is no longer available',
        message:
          'The service no longer has a record of this job. Submitting the image again will create a new job.',
      }
    }

    if (error.status === 409) {
      return {
        title: "This result isn't ready yet",
        message: 'Your image is still being processed. This page updates on its own.',
      }
    }

    return {
      title: "We couldn't load your result",
      message: `Your job finished, but the result could not be retrieved: ${error.message} ${TRY_AGAIN}`,
    }
  }

  return {
    title: "We couldn't load your result",
    message: `Your job finished, but something unexpected stopped the result from loading. ${TRY_AGAIN}`,
  }
}
