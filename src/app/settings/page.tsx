'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  SunIcon, 
  MoonIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline'

interface UserPreferences {
  id: string
  defaultStatus: string
  defaultFollowUpDays: number
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme, isDark, isLight } = useTheme()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchPreferences()
  }, [session, status, router])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      } else {
        setError('Failed to load preferences')
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      setError('Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    setSaving(true)
    setError('')
    
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedPreferences = await response.json()
        setPreferences(updatedPreferences)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      setError('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      description: 'Always use light theme',
      icon: SunIcon,
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      description: 'Always use dark theme',
      icon: MoonIcon,
    },
  ]

  const cardClasses = isDark ? 'bg-gray-800' : 'bg-white'
  const textClasses = isDark ? 'text-white' : 'text-gray-900'
  const secondaryTextClasses = isDark ? 'text-gray-400' : 'text-gray-600'

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${textClasses}`}>Settings</h1>
          <p className={secondaryTextClasses}>Manage your application preferences and settings</p>
        </div>

        {/* Appearance Settings */}
        <div className={`${cardClasses} shadow rounded-lg p-6 mb-6`}>
          <h2 className={`text-lg font-medium ${textClasses} mb-4`}>Appearance</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className={`text-sm font-medium ${textClasses} mb-3`}>Theme</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = theme === option.value
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`relative flex items-center space-x-3 rounded-lg border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isSelected
                          ? (isDark ? 'border-blue-600 bg-blue-900/50' : 'border-blue-300 bg-blue-50')
                          : (isDark ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-50')
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${
                          isSelected 
                            ? (isDark ? 'text-blue-400' : 'text-blue-600')
                            : (isDark ? 'text-gray-500' : 'text-gray-400')
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${
                              isSelected 
                                ? (isDark ? 'text-blue-100' : 'text-blue-900')
                                : textClasses
                            }`}>
                              {option.label}
                            </p>
                            <p className={`text-xs ${
                              isSelected 
                                ? (isDark ? 'text-blue-300' : 'text-blue-700')
                                : secondaryTextClasses
                            }`}>
                              {option.description}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckIcon className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className={`${cardClasses} shadow rounded-lg p-6`}>
          <h2 className={`text-lg font-medium ${textClasses} mb-4`}>Application Tracking</h2>
          
          {error && (
            <div className={`mb-4 p-3 rounded-md border ${
              isDark 
                ? 'bg-red-900/20 border-red-800 text-red-200' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="default-status" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Default Application Status
              </label>
              <select
                id="default-status"
                value={preferences?.defaultStatus || 'APPLIED'}
                onChange={(e) => updatePreferences({ defaultStatus: e.target.value })}
                disabled={saving}
                className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="APPLIED">Applied</option>
                <option value="PHONE_SCREENING">Phone Screening</option>
                <option value="TECHNICAL_INTERVIEW">Technical Interview</option>
                <option value="ONSITE_INTERVIEW">Onsite Interview</option>
                <option value="FINAL_INTERVIEW">Final Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="reminder-days" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Default Follow-up Reminder (days)
              </label>
              <input
                type="number"
                id="reminder-days"
                min="1"
                max="30"
                value={preferences?.defaultFollowUpDays || 7}
                onChange={(e) => updatePreferences({ defaultFollowUpDays: parseInt(e.target.value) })}
                disabled={saving}
                className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Automatically set follow-up reminders this many days after applying
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
