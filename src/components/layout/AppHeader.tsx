import { Chip } from '@heroui/react'
import { NavLink } from 'react-router-dom'
import { APP_NAME, ROUTES } from '@/lib/constants'

interface AppHeaderProps {
  jobCount: number
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    'focus-visible:focus-ring',
    isActive
      ? 'bg-surface-secondary text-accent underline underline-offset-2' 
      : 'text-muted hover:text-foreground',
  ].join(' ')

export function AppHeader({ jobCount }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <NavLink
          to={ROUTES.upload}
          className="rounded-md text-base font-semibold tracking-tight focus-visible:focus-ring"
        >
          {APP_NAME}
        </NavLink>

        <nav aria-label="Main" className="flex items-center gap-1">
          <NavLink to={ROUTES.upload} end className={navLinkClass}>
            Upload
          </NavLink>
          <NavLink to={ROUTES.jobs} className={navLinkClass}>
            <span className="flex items-center gap-2">
              Jobs
              <Chip size="sm" variant="secondary" aria-hidden="true">
                {jobCount}
              </Chip>
              <span className="sr-only">
                {jobCount === 1 ? '1 job' : `${jobCount} jobs`}
              </span>
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
