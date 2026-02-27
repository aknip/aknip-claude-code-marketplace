import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  LayoutGrid,
  Car,
} from 'lucide-react'
import { type SidebarData } from '@/apps/main/components/layout/types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/main/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/main/tasks',
          icon: ListTodo,
        },
        {
          title: 'Chats',
          url: '/main/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/main/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Landing Page',
          url: '/main/kfz-marktplatz',
          icon: Car,
        },
        {
          title: 'Component Overview',
          url: '/main/component-showcase',
          icon: LayoutGrid,
        },
        {
          title: 'Apps',
          url: '/main/apps',
          icon: Package,
        },
        {
          title: 'System Pages',
          icon: Bug,
          items: [
            {
              title: 'Sign In',
              url: '/main/sign-in',
              icon: ShieldCheck,
            },
            {
              title: 'Sign In (2 Col)',
              url: '/main/sign-in-2',
              icon: ShieldCheck,
            },
            {
              title: 'Sign Up',
              url: '/main/sign-up',
              icon: ShieldCheck,
            },
            {
              title: 'Forgot Password',
              url: '/main/forgot-password',
              icon: ShieldCheck,
            },
            {
              title: 'OTP',
              url: '/main/otp',
              icon: ShieldCheck,
            },
            {
              title: 'Unauthorized',
              url: '/main/401',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/main/403',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/main/404',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/main/500',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/main/503',
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/main/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/main/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/main/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/main/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/main/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/main/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}

// Also export as referenceAppSidebarData for backwards compatibility
export const referenceAppSidebarData = sidebarData
