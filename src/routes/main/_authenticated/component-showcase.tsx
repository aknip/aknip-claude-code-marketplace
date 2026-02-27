import { createFileRoute } from '@tanstack/react-router'
import { ComponentExample } from '@/apps/main/components/component-example'

export const Route = createFileRoute('/main/_authenticated/component-showcase')({
  component: ComponentExample,
})
