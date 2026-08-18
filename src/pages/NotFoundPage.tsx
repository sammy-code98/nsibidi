import { Card } from '@heroui/react'
import { LinkButton } from '@/components/ui/LinkButton'
import { ROUTES } from '@/lib/constants'

export function NotFoundPage() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Page not found</Card.Title>
        <Card.Description>
          The page you were looking for does not exist.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <LinkButton href={ROUTES.upload}>Go to upload</LinkButton>
      </Card.Footer>
    </Card>
  )
}
