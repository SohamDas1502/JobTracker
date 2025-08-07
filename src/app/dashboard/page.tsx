'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardStats from '@/components/dashboard/DashboardStats'
import RecentApplications from '@/components/dashboard/RecentApplications'
import UpcomingReminders from '@/components/dashboard/UpcomingReminders'
import { useTheme } from '@/contexts/ThemeContext'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDark, isLight } = useTheme()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const containerClasses = isDark 
    ? 'bg-gray-800 text-white' 
    : 'bg-white text-gray-900'

  const secondaryTextClasses = isDark 
    ? 'text-gray-400' 
    : 'text-gray-600'

  return (
    <DashboardLayout>
      <div className={`space-y-6 ${isDark ? 'theme-dark' : 'theme-light'}`}>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {session.user?.name || 'User'}!
          </h1>
          <p className={secondaryTextClasses}>
            Here's an overview of your job application progress.
          </p>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentApplications />
          <UpcomingReminders />
        </div>
      </div>
    </DashboardLayout>
  )
}
