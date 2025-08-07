'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

const createJobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  salary: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']).optional(),
  workLocation: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
  status: z.enum(['APPLIED', 'PHONE_SCREENING', 'TECHNICAL_INTERVIEW', 'ONSITE_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  appliedDate: z.string().optional(),
  deadline: z.string().optional(),
  followUpReminder: z.string().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  notes: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
})

type CreateJobFormData = z.infer<typeof createJobSchema>

export default function NewApplicationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDark, isLight } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showFollowUpReminder, setShowFollowUpReminder] = useState(false)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [preferencesLoading, setPreferencesLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      priority: 'MEDIUM',
      appliedDate: new Date().toISOString().split('T')[0], // Today's date
    },
  })

  const watchedStatus = watch('status')
  const watchedAppliedDate = watch('appliedDate')
  const watchedDeadline = watch('deadline')

  // Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences')
        if (response.ok) {
          const preferences = await response.json()
          setUserPreferences(preferences)
          
          // Set default status from preferences
          setValue('status', preferences.defaultStatus)
        }
      } catch (error) {
        console.error('Error fetching preferences:', error)
      } finally {
        setPreferencesLoading(false)
      }
    }
    
    if (session) {
      fetchPreferences()
    }
  }, [session, setValue])

  // Calculate follow-up reminder date based on applied date and deadline
  useEffect(() => {
    if (!userPreferences || !watchedAppliedDate) return
    
    const appliedDate = new Date(watchedAppliedDate)
    const deadlineDate = watchedDeadline ? new Date(watchedDeadline) : null
    
    let followUpDate: Date
    
    if (deadlineDate) {
      const daysDifference = Math.ceil((deadlineDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDifference <= userPreferences.defaultFollowUpDays) {
        // If deadline is within default reminder days, set reminder to day before deadline
        followUpDate = new Date(deadlineDate)
        followUpDate.setDate(followUpDate.getDate() - 1)
      } else {
        // Use default follow-up days
        followUpDate = new Date(appliedDate)
        followUpDate.setDate(followUpDate.getDate() + userPreferences.defaultFollowUpDays)
      }
    } else {
      // No deadline, use default follow-up days
      followUpDate = new Date(appliedDate)
      followUpDate.setDate(followUpDate.getDate() + userPreferences.defaultFollowUpDays)
    }
    
    setValue('followUpReminder', followUpDate.toISOString().split('T')[0])
  }, [watchedAppliedDate, watchedDeadline, userPreferences, setValue])

  useEffect(() => {
    // Show follow-up reminder field for all statuses
    setShowFollowUpReminder(true)
  }, [watchedStatus])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  const onSubmit = async (data: CreateJobFormData) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Convert date strings to ISO format if provided
      const submitData = {
        ...data,
        appliedDate: data.appliedDate ? new Date(data.appliedDate).toISOString() : undefined,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
        followUpReminder: data.followUpReminder ? new Date(data.followUpReminder).toISOString() : undefined,
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create application')
      }

      const result = await response.json()
      router.push(`/applications/${result.id}`)
    } catch (error) {
      console.error('Error creating application:', error)
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || preferencesLoading) {
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/applications"
            className={`inline-flex items-center text-sm hover:opacity-80 ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Applications
          </Link>
          <h1 className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Add New Job Application
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Fill in the details of your job application
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Company *
                </label>
                <input
                  {...register('company')}
                  type="text"
                  id="company"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., Google, Microsoft, Apple"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="position" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Position *
                </label>
                <input
                  {...register('position')}
                  type="text"
                  id="position"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., Software Engineer, Product Manager"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location
                </label>
                <input
                  {...register('location')}
                  type="text"
                  id="location"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div>
                <label htmlFor="jobUrl" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Job URL
                </label>
                <input
                  {...register('jobUrl')}
                  type="url"
                  id="jobUrl"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="https://company.com/jobs/123"
                />
                {errors.jobUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobUrl.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="salary" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Salary Range
                </label>
                <input
                  {...register('salary')}
                  type="text"
                  id="salary"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., $120k - $150k"
                />
              </div>

              <div>
                <label htmlFor="priority" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priority
                </label>
                <select
                  {...register('priority')}
                  id="priority"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Job Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Application Status
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
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
                <label htmlFor="jobType" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Job Type
                </label>
                <select
                  {...register('jobType')}
                  id="jobType"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="">Select job type</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>

              <div>
                <label htmlFor="workLocation" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Work Location
                </label>
                <select
                  {...register('workLocation')}
                  id="workLocation"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="">Select work location</option>
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div>
                <label htmlFor="appliedDate" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Applied Date
                </label>
                <input
                  {...register('appliedDate')}
                  type="date"
                  id="appliedDate"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="deadline" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Application Deadline
                </label>
                <input
                  {...register('deadline')}
                  type="date"
                  id="deadline"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>

              {showFollowUpReminder && (
                <div>
                  <label htmlFor="followUpReminder" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Follow-up Reminder
                  </label>
                  <input
                    {...register('followUpReminder')}
                    type="date"
                    id="followUpReminder"
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userPreferences && watchedDeadline && (
                      (() => {
                        const appliedDate = new Date(watchedAppliedDate || new Date())
                        const deadlineDate = new Date(watchedDeadline)
                        const daysDifference = Math.ceil((deadlineDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
                        
                        if (daysDifference <= userPreferences.defaultFollowUpDays) {
                          return `Auto-set to day before deadline (${daysDifference} days until deadline)`
                        } else {
                          return `Auto-set to ${userPreferences.defaultFollowUpDays} days after applied date`
                        }
                      })()
                    )}
                    {userPreferences && !watchedDeadline && `Auto-set to ${userPreferences.defaultFollowUpDays} days after applied date`}
                    {!userPreferences && 'Set a date to receive a follow-up reminder for this application'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Job Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Brief description of the role and responsibilities..."
              />
            </div>

            <div className="mt-6">
              <label htmlFor="requirements" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Requirements
              </label>
              <textarea
                {...register('requirements')}
                id="requirements"
                rows={4}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Key requirements and qualifications..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Contact Information (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="contactName" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Name
                </label>
                <input
                  {...register('contactName')}
                  type="text"
                  id="contactName"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Email
                </label>
                <input
                  {...register('contactEmail')}
                  type="email"
                  id="contactEmail"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="john@company.com"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactPhone" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Phone
                </label>
                <input
                  {...register('contactPhone')}
                  type="tel"
                  id="contactPhone"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notes
            </h2>
            <div>
              <label htmlFor="notes" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Additional Notes
              </label>
              <textarea
                {...register('notes')}
                id="notes"
                rows={4}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Any additional information, thoughts, or reminders about this application..."
              />
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className={`border rounded-md p-4 ${
              isDark 
                ? 'bg-red-900/20 border-red-800 text-red-200' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <p className="text-sm">{submitError}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className={`px-4 py-2 border rounded-md text-sm font-medium hover:opacity-90 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
