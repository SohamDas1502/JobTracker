'use client'

import { ReactNode, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useTheme } from '@/contexts/ThemeContext'
import {
  HomeIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CogIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface DashboardLayoutProps {
  children: ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Applications', href: '/applications', icon: BriefcaseIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const { profile } = useUser()
  const { isDark, isLight } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Theme-based classes
  const bgClasses = isDark ? 'bg-gray-900' : 'bg-gray-50'
  const sidebarBgClasses = isDark ? 'bg-gray-800' : 'bg-white'
  const sidebarTextClasses = isDark ? 'text-gray-300' : 'text-gray-700'
  const activeItemClasses = isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-700'
  const hoverItemClasses = isDark ? 'hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-50 hover:text-gray-900'

  return (
    <div className={`h-screen flex ${bgClasses}`}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${isDark ? 'dark:bg-gray-900 dark:bg-opacity-75' : ''}`} onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full ${sidebarBgClasses}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent 
            navigation={navigation} 
            pathname={pathname} 
            isDark={isDark}
            sidebarTextClasses={sidebarTextClasses}
            activeItemClasses={activeItemClasses}
            hoverItemClasses={hoverItemClasses}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent 
            navigation={navigation} 
            pathname={pathname} 
            isDark={isDark}
            sidebarTextClasses={sidebarTextClasses}
            activeItemClasses={activeItemClasses}
            hoverItemClasses={hoverItemClasses}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className={`${sidebarBgClasses} shadow-sm border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  type="button"
                  className={`lg:hidden px-4 border-r ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
                  onClick={() => setSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className={`ml-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>JobStash</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile"
                  className={`flex items-center space-x-2 ${hoverItemClasses} rounded-md px-2 py-1 transition-colors`}
                >
                  {profile?.image ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={profile.image}
                      alt={profile.name || 'Profile'}
                    />
                  ) : (
                    <UserCircleIcon className={`h-8 w-8 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`} />
                  )}
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}>
                    {session?.user?.name || 'User'}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto ${bgClasses}`}>
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ 
  navigation, 
  pathname,
  isDark,
  sidebarTextClasses,
  activeItemClasses,
  hoverItemClasses
}: { 
  navigation: NavigationItem[]
  pathname: string
  isDark: boolean
  sidebarTextClasses: string
  activeItemClasses: string
  hoverItemClasses: string
}) {
  const sidebarBgClasses = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  const titleClasses = isDark ? 'text-blue-400' : 'text-blue-600'

  return (
    <div className={`flex flex-col flex-grow border-r ${sidebarBgClasses} pt-5 pb-4 overflow-y-auto`}>
      <div className="flex items-center flex-shrink-0 px-4">
        <h1 className={`text-xl font-bold ${titleClasses}`}>JobStash</h1>
      </div>
      <div className="mt-5 flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item: NavigationItem) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? activeItemClasses
                    : `${sidebarTextClasses} ${hoverItemClasses}`
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive 
                      ? (isDark ? 'text-blue-400' : 'text-blue-500')
                      : (isDark ? 'text-gray-500 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-500')
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
