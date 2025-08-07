'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useTheme } from '@/contexts/ThemeContext'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface JobApplication {
  id: string
  company: string
  position: string
  location?: string
  status: string
  priority: string
  appliedDate: string
  salary?: string
  jobType?: string
  workLocation?: string
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const { isDark } = useTheme()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session) {
      fetchApplications()
    }
  }, [session, searchTerm, statusFilter, priorityFilter])

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (priorityFilter) params.append('priority', priorityFilter)
      
      const response = await fetch(`/api/jobs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800'
      case 'PHONE_SCREENING':
      case 'TECHNICAL_INTERVIEW':
      case 'ONSITE_INTERVIEW':
      case 'FINAL_INTERVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'OFFER':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Job Applications</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track and manage all your job applications</p>
          </div>
          <Link
            href="/applications/new"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90 ${
              isDark ? 'bg-blue-500' : 'bg-blue-600'
            }`}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Application
          </Link>
        </div>

        {/* Filters */}
        <div className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="search"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    isDark 
                      ? 'border-gray-600 text-white bg-gray-700 placeholder-gray-400' 
                      : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500'
                  }`}
                  placeholder="Company or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className={`absolute left-3 top-3 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                id="status"
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isDark 
                    ? 'border-gray-600 text-white bg-gray-700' 
                    : 'border-gray-300 text-gray-900 bg-white'
                }`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
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
              <label htmlFor="priority" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                id="priority"
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isDark 
                    ? 'border-gray-600 text-white bg-gray-700' 
                    : 'border-gray-300 text-gray-900 bg-white'
                }`}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setPriorityFilter('')
                }}
                className={`w-full px-4 py-2 border rounded-md text-sm font-medium hover:opacity-90 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 bg-gray-700' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className={`shadow rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className={`h-4 rounded w-3/4 mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-3 rounded w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No applications found</p>
              <Link
                href="/applications/new"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90 ${
                  isDark ? 'bg-blue-500' : 'bg-blue-600'
                }`}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Application
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Company & Position
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Priority
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Applied Date
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark 
                    ? 'bg-gray-800 divide-gray-700' 
                    : 'bg-white divide-gray-200'
                }`}>
                  {applications.map((application) => (
                    <tr key={application.id} className={`hover:opacity-90 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {application.position}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {application.company} {application.location && `• ${application.location}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {application.priority}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(application.appliedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/applications/${application.id}`}
                          className={`hover:opacity-80 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
