import { createFileRoute } from '@tanstack/react-router'
import { Chats } from '@/apps/main/features/chats'

export const Route = createFileRoute('/main/_authenticated/chats/')({
  component: Chats,
})
