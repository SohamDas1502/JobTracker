'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PasswordResetModal from '@/components/modals/PasswordResetModal'
import { useUser } from '@/contexts/UserContext'
import { useTheme } from '@/contexts/ThemeContext'
import { UserCircleIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: string
}

interface UserStats {
  totalApplications: number
  activeReminders: number
  daysActive: number
}

interface JobApplication {
  id: string
  company: string
  position: string
  location?: string
  status: string
  priority: string
  appliedDate: string
  deadline?: string
  salary?: string
  jobType?: string
  workLocation?: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { profile, loading: profileLoading } = useUser()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set())
  const [loadingApplications, setLoadingApplications] = useState(false)
  const { isDark } = useTheme()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/profile/stats')

      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData)
      } else if (response.status === 401) {
        router.push('/auth/signin')
      } else {
        setError('Failed to load profile stats')
      }
    } catch (error) {
      console.error('Error fetching profile stats:', error)
      setError('Failed to load profile stats')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    setLoadingApplications(true)
    try {
      const response = await fetch('/api/jobs?sortBy=appliedDate&sortOrder=desc')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else {
        console.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleExportClick = () => {
    setShowExportModal(true)
    fetchApplications()
  }

  const handleCloseModal = () => {
    setShowExportModal(false)
    setSelectedApplications(new Set())
  }

  const handleSelectApplication = (id: string) => {
    const newSelected = new Set(selectedApplications)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedApplications(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedApplications.size === applications.length) {
      setSelectedApplications(new Set())
    } else {
      setSelectedApplications(new Set(applications.map(app => app.id)))
    }
  }

  const handleExport = () => {
    const selectedApps = applications.filter(app => selectedApplications.has(app.id))
    
    // Create CSV content
    const headers = ['Company', 'Position', 'Location', 'Status', 'Priority', 'Applied Date', 'Deadline', 'Salary', 'Job Type', 'Work Location']
    const csvContent = [
      headers.join(','),
      ...selectedApps.map(app => [
        app.company,
        app.position,
        app.location || '',
        app.status,
        app.priority,
        formatDateForCSV(app.appliedDate),
        formatDateForCSV(app.deadline || ''),
        app.salary || '',
        app.jobType || '',
        app.workLocation || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `job-applications-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    handleCloseModal()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateForCSV = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-CA') // Returns YYYY-MM-DD format
  }

  if (status === 'loading' || loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <p className="text-sm text-gray-600">Profile not found</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your account information and preferences</p>
        </div>

        {/* Profile Information */}
        <div className={`shadow rounded-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Personal Information</h2>
            <Link
              href="/profile/edit"
              className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:opacity-90 ${
                isDark 
                  ? 'border-gray-600 text-gray-300 bg-gray-700' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {profile.image ? (
                <img
                  className="h-20 w-20 rounded-full object-cover"
                  src={profile.image}
                  alt={profile.name || 'Profile'}
                />
              ) : (
                <UserCircleIcon className="h-20 w-20 text-gray-300 dark:text-gray-600" />
              )}
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name
                  </label>
                  <p className={`text-sm rounded-md px-3 py-2 ${
                    isDark 
                      ? 'text-white bg-gray-700' 
                      : 'text-gray-900 bg-gray-50'
                  }`}>
                    {profile.name || 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address
                  </label>
                  <p className={`text-sm rounded-md px-3 py-2 ${
                    isDark 
                      ? 'text-white bg-gray-700' 
                      : 'text-gray-900 bg-gray-50'
                  }`}>
                    {profile.email || 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Member Since
                  </label>
                  <p className={`text-sm rounded-md px-3 py-2 ${
                    isDark 
                      ? 'text-white bg-gray-700' 
                      : 'text-gray-900 bg-gray-50'
                  }`}>
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    User ID
                  </label>
                  <p className={`text-sm rounded-md px-3 py-2 font-mono ${
                    isDark 
                      ? 'text-gray-400 bg-gray-700' 
                      : 'text-gray-500 bg-gray-50'
                  }`}>
                    {profile.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className={`shadow rounded-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {stats ? stats.totalApplications : '--'}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Applications</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {stats ? stats.activeReminders : '--'}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Reminders</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {stats ? stats.daysActive : '--'}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Days Active</div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Actions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Password</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Update your account password</p>
              </div>
              <button 
                onClick={() => setShowPasswordResetModal(true)}
                className={`px-4 py-2 border rounded-md text-sm font-medium hover:opacity-90 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 bg-gray-700' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Change
              </button>
            </div>
            
            <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Export Data</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Download all your application data</p>
                </div>
                <button 
                  onClick={handleExportClick}
                  className={`px-4 py-2 border rounded-md text-sm font-medium hover:opacity-90 ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 bg-gray-700' 
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Export
                </button>
              </div>
            </div>

            <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-900'}`}>Delete Account</h3>
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>Permanently delete your account and all data</p>
                </div>
                <button className={`px-4 py-2 border rounded-md text-sm font-medium hover:opacity-90 ${
                  isDark 
                    ? 'border-red-600 text-red-400 bg-gray-700 hover:bg-red-900/20' 
                    : 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                }`}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
              {/* Modal Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Export Applications
                </h2>
                <button
                  onClick={handleCloseModal}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-6 overflow-auto">
              {loadingApplications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No applications found to export.
                  </p>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative mr-3">
                        <input
                          type="checkbox"
                          checked={selectedApplications.size === applications.length && applications.length > 0}
                          onChange={handleSelectAll}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedApplications.size === applications.length && applications.length > 0
                            ? 'bg-green-600 border-green-600 shadow-md' 
                            : isDark
                            ? 'bg-gray-700 border-gray-500 hover:border-gray-400'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}>
                          {selectedApplications.size === applications.length && applications.length > 0 && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Select All ({applications.length} applications)
                      </span>
                    </label>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedApplications.size} selected
                    </span>
                  </div>

                  {/* Applications List */}
                  <div className="space-y-3">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className={`flex items-center p-4 border rounded-lg ${
                          isDark 
                            ? 'border-gray-700 hover:bg-gray-700' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {application.position}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                application.status === 'APPLIED' 
                                  ? isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                  : application.status === 'OFFER' 
                                  ? isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                  : application.status === 'REJECTED' 
                                  ? isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                                  : isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {application.status.replace('_', ' ')}
                              </span>
                              <label className="cursor-pointer">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={selectedApplications.has(application.id)}
                                    onChange={() => handleSelectApplication(application.id)}
                                    className="sr-only"
                                  />
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                    selectedApplications.has(application.id)
                                      ? 'bg-green-600 border-green-600 shadow-md' 
                                      : isDark
                                      ? 'bg-gray-700 border-gray-500 hover:border-gray-400'
                                      : 'bg-white border-gray-300 hover:border-gray-400'
                                  }`}>
                                    {selectedApplications.has(application.id) && (
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {application.company}
                            {application.location && ` • ${application.location}`}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Applied: {formatDate(application.appliedDate)} • Priority: {application.priority}
                            {application.deadline && ` • Deadline: ${formatDate(application.deadline)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between p-6 border-t flex-shrink-0 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={handleCloseModal}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={selectedApplications.size === 0}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedApplications.size === 0
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                Export Selected ({selectedApplications.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      <PasswordResetModal 
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        userEmail={session?.user?.email || ''}
      />
    </DashboardLayout>
  )
}
