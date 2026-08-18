import type { TrackedJob } from '@/features/jobs/job.types'
import { JobCard } from './JobCard'

interface JobListProps {
  jobs: TrackedJob[]
}

/** Every job submitted this session, newest first. */
export function JobList({ jobs }: JobListProps) {
  return (
    <ul className="space-y-3">
      {jobs.map((job) => (
        <li key={job.id}>
          <JobCard job={job} />
        </li>
      ))}
    </ul>
  )
}
