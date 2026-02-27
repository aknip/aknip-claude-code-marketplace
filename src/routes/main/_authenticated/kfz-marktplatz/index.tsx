import { createFileRoute } from '@tanstack/react-router'
import { KfzMarktplatz } from '@/apps/main/features/kfz-marktplatz'

export const Route = createFileRoute('/main/_authenticated/kfz-marktplatz/')({
  component: KfzMarktplatz,
})
