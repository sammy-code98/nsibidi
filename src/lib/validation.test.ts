import { describe, expect, it } from 'vitest'
import { imageFile } from '@/test/utils'
import { MAX_FILE_SIZE_BYTES, validateImageFile } from './validation'

describe('validateImageFile', () => {
  it.each([
    ['PNG', 'photo.png', 'image/png'],
    ['JPG', 'photo.jpg', 'image/jpeg'],
    ['JPEG', 'photo.jpeg', 'image/jpeg'],
  ])('accepts a valid %s', (_label, name, type) => {
    expect(validateImageFile(imageFile(name, { type })).ok).toBe(true)
  })

  it('rejects an unsupported type and says what is accepted', () => {
    const result = validateImageFile(
      imageFile('animation.gif', { type: 'image/gif' }),
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('unsupported-type')
    expect(result.error.message).toContain('animation.gif')
    expect(result.error.message).toContain('PNG, JPG or JPEG')
  })

  it('rejects a file over the size limit and states both sizes', () => {
    const result = validateImageFile(
      imageFile('huge.png', { size: MAX_FILE_SIZE_BYTES + 1 }),
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('too-large')
    expect(result.error.message).toMatch(/10 MB/)
  })

  it('accepts a file exactly at the limit', () => {
    expect(
      validateImageFile(imageFile('edge.png', { size: MAX_FILE_SIZE_BYTES }))
        .ok,
    ).toBe(true)
  })

  it('rejects an empty file', () => {
    const result = validateImageFile(imageFile('empty.png', { size: 0 }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('empty-file')
  })

  it('falls back to the extension when the browser reports no type', () => {
    expect(validateImageFile(imageFile('photo.JPG', { type: '' })).ok).toBe(
      true,
    )
    expect(validateImageFile(imageFile('archive.zip', { type: '' })).ok).toBe(
      false,
    )
  })

  it('never returns a rejection without an explanation', () => {
    const rejections = [
      imageFile('doc.pdf', { type: 'application/pdf' }),
      imageFile('huge.png', { size: MAX_FILE_SIZE_BYTES + 1 }),
      imageFile('empty.png', { size: 0 }),
    ].map(validateImageFile)

    for (const result of rejections) {
      expect(result.ok).toBe(false)
      if (result.ok) continue
      expect(result.error.title.length).toBeGreaterThan(0)
      expect(result.error.message.length).toBeGreaterThan(0)
      expect(result.error.message).not.toMatch(/^something went wrong/i)
    }
  })
})
