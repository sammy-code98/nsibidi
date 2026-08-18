import { Button, Card } from '@heroui/react'

export function App() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-4 py-16">
      <Card className="w-full">
        <Card.Header>
          <Card.Title className="text-3xl font-semibold tracking-tight">
            Nsibidi
          </Card.Title>
          <Card.Description className="text-base">
            Async image processing made simple.
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button variant="primary">Upload an image</Button>
        </Card.Footer>
      </Card>
    </main>
  )
}
