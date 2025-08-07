'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { BellIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'

interface UpcomingReminder {
  id: string
  title: string
  description: string | null
  remindAt: string
  reminderType: string
  jobApplication: {
    company: string
    position: string
    deadline: string | null
  }
}

export default function UpcomingReminders() {
  const [reminders, setReminders] = useState<UpcomingReminder[]>([])
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()

  useEffect(() => {
    fetchUpcomingReminders()
  }, [])

  const fetchUpcomingReminders = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setReminders(data.upcomingReminders || [])
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Reminders</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className={`h-4 rounded w-3/4 mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-3 rounded w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getReminderTypeColor = (type: string) => {
    if (isDark) {
      switch (type) {
        case 'interview':
          return 'bg-purple-900/30 text-purple-400'
        case 'follow_up':
          return 'bg-blue-900/30 text-blue-400'
        case 'deadline':
          return 'bg-red-900/30 text-red-400'
        default:
          return 'bg-gray-700 text-gray-400'
      }
    } else {
      switch (type) {
        case 'interview':
          return 'bg-purple-100 text-purple-800'
        case 'follow_up':
          return 'bg-blue-100 text-blue-800'
        case 'deadline':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }

  return (
    <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Reminders</h3>
        <BellIcon className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      </div>
      <div className="p-6">
        {reminders.length === 0 ? (
          <div className="text-center py-8">
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming reminders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-start space-x-3 p-4 border rounded-lg ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  <BellIcon className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {reminder.title}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReminderTypeColor(
                        reminder.reminderType
                      )}`}
                    >
                      {reminder.reminderType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {reminder.jobApplication.position} at {reminder.jobApplication.company}
                    {reminder.jobApplication.deadline && (
                      <span className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}> • Deadline: {formatDate(reminder.jobApplication.deadline)}</span>
                    )}
                  </p>
                  {reminder.description && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {reminder.description}
                    </p>
                  )}
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formatDate(reminder.remindAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
