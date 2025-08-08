'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useTheme } from '@/contexts/ThemeContext'
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface JobApplication {
  id: string
  company: string
  position: string
  location?: string
  jobUrl?: string
  salary?: string
  status: string
  priority: string
  jobType?: string
  workLocation?: string
  appliedDate: string
  deadline?: string
  description?: string
  requirements?: string
  notes?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  createdAt: string
  updatedAt: string
}

export default function ApplicationDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const applicationId = params?.id as string
  const { isDark } = useTheme()
  
  const [application, setApplication] = useState<JobApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session && applicationId) {
      fetchApplication()
    }
  }, [session, applicationId])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/jobs/${applicationId}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data)
      } else if (response.status === 404) {
        setError('Application not found')
      } else {
        setError('Failed to load application')
      }
    } catch (error) {
      console.error('Error fetching application:', error)
      setError('Failed to load application')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/jobs/${applicationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/applications')
      } else {
        setError('Failed to delete application')
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      setError('Failed to delete application')
    }
  }

  const getStatusColor = (status: string) => {
    const lightColors = {
      'APPLIED': 'bg-blue-100 text-blue-800',
      'PHONE_SCREENING': 'bg-purple-100 text-purple-800',
      'TECHNICAL_INTERVIEW': 'bg-yellow-100 text-yellow-800',
      'ONSITE_INTERVIEW': 'bg-yellow-100 text-yellow-800',
      'FINAL_INTERVIEW': 'bg-yellow-100 text-yellow-800',
      'OFFER': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'WITHDRAWN': 'bg-gray-100 text-gray-800'
    }
    
    const darkColors = {
      'APPLIED': 'bg-blue-900/50 text-blue-300',
      'PHONE_SCREENING': 'bg-purple-900/50 text-purple-300',
      'TECHNICAL_INTERVIEW': 'bg-yellow-900/50 text-yellow-300',
      'ONSITE_INTERVIEW': 'bg-yellow-900/50 text-yellow-300',
      'FINAL_INTERVIEW': 'bg-yellow-900/50 text-yellow-300',
      'OFFER': 'bg-green-900/50 text-green-300',
      'REJECTED': 'bg-red-900/50 text-red-300',
      'WITHDRAWN': 'bg-gray-700/50 text-gray-300'
    }
    
    const colors = isDark ? darkColors : lightColors
    return colors[status as keyof typeof colors] || (isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-800')
  }

  const getPriorityColor = (priority: string) => {
    const lightColors = {
      'HIGH': 'bg-red-100 text-red-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'LOW': 'bg-gray-100 text-gray-800'
    }
    
    const darkColors = {
      'HIGH': 'bg-red-900/50 text-red-300',
      'MEDIUM': 'bg-yellow-900/50 text-yellow-300',
      'LOW': 'bg-gray-700/50 text-gray-300'
    }
    
    const colors = isDark ? darkColors : lightColors
    return colors[priority as keyof typeof colors] || (isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-800')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          <Link
            href="/applications"
            className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
          >
            Back to Applications
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Application not found</p>
          <Link
            href="/applications"
            className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
          >
            Back to Applications
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/applications"
            className={`inline-flex items-center text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Applications
          </Link>
          <div className="mt-4 flex justify-between items-start">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {application.position}
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{application.company}</p>
              {application.location && (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{application.location}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                  isDark 
                    ? 'border-red-600 text-red-400 bg-gray-800 hover:bg-red-900/20' 
                    : 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                }`}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
              <Link
                href={`/applications/${application.id}/edit`}
                className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</h3>
                <span
                  className={`mt-1 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                    application.status
                  )}`}
                >
                  {application.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Priority</h3>
                <span
                  className={`mt-1 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(
                    application.priority
                  )}`}
                >
                  {application.priority}
                </span>
              </div>
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Applied Date</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {formatDate(application.appliedDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {application.jobType && (
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Job Type</h3>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {application.jobType.replace('_', ' ')}
                  </p>
                </div>
              )}
              {application.workLocation && (
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Work Location</h3>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{application.workLocation}</p>
                </div>
              )}
              {application.salary && (
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Salary Range</h3>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{application.salary}</p>
                </div>
              )}
              {application.deadline && (
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Deadline</h3>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {formatDate(application.deadline)}
                  </p>
                </div>
              )}
              {application.jobUrl && (
                <div className="md:col-span-2">
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Job URL</h3>
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-1 text-sm break-all ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                  >
                    {application.jobUrl}
                  </a>
                </div>
              )}
            </div>

            {application.description && (
              <div className="mt-6">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Description</h3>
                <p className={`mt-1 text-sm whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {application.description}
                </p>
              </div>
            )}

            {application.requirements && (
              <div className="mt-6">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Requirements</h3>
                <p className={`mt-1 text-sm whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {application.requirements}
                </p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {(application.contactName || application.contactEmail || application.contactPhone) && (
            <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {application.contactName && (
                  <div>
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Name</h3>
                    <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{application.contactName}</p>
                  </div>
                )}
                {application.contactEmail && (
                  <div>
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</h3>
                    <a
                      href={`mailto:${application.contactEmail}`}
                      className={`mt-1 text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                    >
                      {application.contactEmail}
                    </a>
                  </div>
                )}
                {application.contactPhone && (
                  <div>
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</h3>
                    <a
                      href={`tel:${application.contactPhone}`}
                      className={`mt-1 text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                    >
                      {application.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Notes</h2>
              <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                {application.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Created</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {formatDate(application.createdAt)}
                </p>
              </div>
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {formatDate(application.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
