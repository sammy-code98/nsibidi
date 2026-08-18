import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { imageFile, renderWithProviders } from '@/test/utils'
import { UploadCard } from './UploadCard'

const fileInput = () =>
  document.querySelector<HTMLInputElement>('input[type="file"]')!

const submitButton = () =>
  screen.getByRole('button', { name: /submit for processing/i })

describe('UploadCard', () => {
  it('keeps submit disabled until a valid file is chosen', async () => {
    renderWithProviders(<UploadCard />)

    expect(submitButton()).toBeDisabled()

    await userEvent.upload(fileInput(), imageFile('holiday.png'))

    expect(await screen.findAllByText('holiday.png')).not.toHaveLength(0)
    expect(submitButton()).toBeEnabled()
  })

  it('rejects an unsupported file and explains why', async () => {
    renderWithProviders(<UploadCard />)

    // `applyAccept: false` bypasses the input's accept filter, so the app's
    // own validation is what gets tested rather than the browser's.
    await userEvent.upload(
      fileInput(),
      imageFile('animation.gif', { type: 'image/gif' }),
      { applyAccept: false },
    )

    expect(
      await screen.findByText(/file type is not supported/i),
    ).toBeDefined()
    // Named both in the dropzone hint and in the rejection message.
    expect(screen.getAllByText(/PNG, JPG or JPEG/).length).toBeGreaterThan(0)
    expect(submitButton()).toBeDisabled()
  })

  it('lets the user remove a staged file', async () => {
    renderWithProviders(<UploadCard />)

    await userEvent.upload(fileInput(), imageFile('holiday.png'))
    await screen.findAllByText('holiday.png')

    await userEvent.click(screen.getByRole('button', { name: /remove/i }))

    await waitFor(() =>
      expect(screen.queryAllByText('holiday.png')).toHaveLength(0),
    )
    expect(submitButton()).toBeDisabled()
  })

  it('explains a rejected submission and offers a retry', async () => {
    renderWithProviders(<UploadCard />)

    // `offline-*` makes the mock service refuse the upload.
    await userEvent.upload(fileInput(), imageFile('offline-photo.png'))
    await screen.findAllByText('offline-photo.png')
    await userEvent.click(submitButton())

    expect(
      await screen.findByText(/couldn't submit your image/i, {}, { timeout: 10_000 }),
    ).toBeDefined()
    expect(screen.getByRole('alert')).toBeDefined()
    expect(screen.getByRole('button', { name: /try again/i })).toBeDefined()
  })
})
