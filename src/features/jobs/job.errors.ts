import { ApiError } from '@/api/client'


export interface FailureDescription {
  title: string
  message: string
}

const TRY_AGAIN = 'Please try again.'


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


export function describeStatusFailure(error: unknown): FailureDescription {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return {
        title: "We couldn't check on this job",
        message:
          'We could not reach the processing service. Check your connection and try again.',
      }
    }

    if (error.status === 404) {
      return {
        title: 'This job is no longer available',
        message:
          'The service has no record of it. Jobs are only tracked for the current session, so a page reload can lose them — upload the image again to create a new job.',
      }
    }

    if (error.isServerError) {
      return {
        title: "We couldn't check on this job",
        message: `The processing service is temporarily unavailable. ${TRY_AGAIN}`,
      }
    }

    return {
      title: "We couldn't check on this job",
      message: `The service returned an error: ${error.message} ${TRY_AGAIN}`,
    }
  }

  return {
    title: "We couldn't check on this job",
    message: `Something unexpected stopped us from checking on it. ${TRY_AGAIN}`,
  }
}
