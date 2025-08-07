'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate, getStatusColor } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

interface RecentApplication {
  id: string
  company: string
  position: string
  status: string
  appliedDate: string
}

export default function RecentApplications() {
  const [applications, setApplications] = useState<RecentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()

  useEffect(() => {
    fetchRecentApplications()
  }, [])

  const fetchRecentApplications = async () => {
    try {
      const response = await fetch('/api/jobs?sortBy=appliedDate&sortOrder=desc&limit=5')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching recent applications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Applications</h3>
        </div>
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
      </div>
    )
  }

  return (
    <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Applications</h3>
        <Link
          href="/applications"
          className={`text-sm hover:opacity-80 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
        >
          View all
        </Link>
      </div>
      <div className="p-6">
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No applications yet</p>
            <Link
              href="/applications/new"
              className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90 ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}
            >
              Add your first application
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className={`flex items-center justify-between p-4 border rounded-lg hover:opacity-90 ${
                  isDark 
                    ? 'border-gray-700 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {application.position}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{application.company}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Applied {formatDate(application.appliedDate)}
                  </p>
                </div>
                <Link
                  href={`/applications/${application.id}`}
                  className={`ml-4 text-sm hover:opacity-80 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
