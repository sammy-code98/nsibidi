import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/client'
import {
  describeResultFailure,
  describeStatusFailure,
  describeSubmissionFailure,
} from './job.errors'

const describers = [
  ['submission', describeSubmissionFailure],
  ['status', describeStatusFailure],
  ['result', describeResultFailure],
] as const

const failures = [
  ['offline', new ApiError('fetch failed', null)],
  ['404', new ApiError('not found', 404)],
  ['409', new ApiError('conflict', 409)],
  ['413', new ApiError('too large', 413)],
  ['500', new ApiError('boom', 500)],
  ['non-api error', new TypeError('undefined is not a function')],
] as const

describe('failure descriptions', () => {
  it.each(describers)('%s failures are always explained', (_name, describe_) => {
    for (const [, error] of failures) {
      const { title, message } = describe_(error)

      expect(title).not.toHaveLength(0)
      expect(message).not.toHaveLength(0)
      // The assessment calls out bare generic errors specifically.
      expect(message.trim()).not.toMatch(
        /^(something went wrong|request failed|error)\.?$/i,
      )
      expect(message).toMatch(
        /try again|check your connection|smaller|the image again|updates on its own/i,
      )
    }
  })

  it('tells an offline user to check their connection', () => {
    expect(describeSubmissionFailure(new ApiError('x', null)).message).toMatch(
      /connection/i,
    )
  })

  it('separates a lost result from a failed job', () => {
    const { message } = describeResultFailure(new ApiError('x', 500))

    expect(message).toMatch(/finished/i)
  })

  it('explains that jobs are only tracked for the session', () => {
    expect(describeStatusFailure(new ApiError('x', 404)).message).toMatch(
      /session/i,
    )
  })
})
