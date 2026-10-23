type RoutePlaceholderProps = {
  title: string
}

export function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-16">
      <h1 className="font-display text-ink text-5xl">{title}</h1>
    </main>
  )
}
