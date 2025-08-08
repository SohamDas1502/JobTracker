'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const updateJobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  salary: z.string().optional(),
  status: z.enum(['APPLIED', 'PHONE_SCREENING', 'TECHNICAL_INTERVIEW', 'ONSITE_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']).optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']).optional(),
  workLocation: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
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

type UpdateJobFormData = z.infer<typeof updateJobSchema>

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
}

export default function EditApplicationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const applicationId = params?.id as string
  
  const [application, setApplication] = useState<JobApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [showFollowUpReminder, setShowFollowUpReminder] = useState(false)
  const [formInitialized, setFormInitialized] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateJobFormData>({
    resolver: zodResolver(updateJobSchema),
  })

  const watchedStatus = watch('status')
  const watchedAppliedDate = watch('appliedDate')
  const watchedDeadline = watch('deadline')

  useEffect(() => {
    // Show follow-up reminder field for all statuses
    setShowFollowUpReminder(true)
  }, [watchedStatus])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session && applicationId && !formInitialized) {
      fetchApplication()
    }
  }, [session, applicationId, formInitialized])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/jobs/${applicationId}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data)
        
        // Only populate form with existing data if it hasn't been initialized yet
        if (!formInitialized) {
          reset({
            company: data.company || '',
            position: data.position || '',
            location: data.location || '',
            jobUrl: data.jobUrl || '',
            salary: data.salary || '',
            status: data.status || 'APPLIED',
            jobType: data.jobType || '',
            workLocation: data.workLocation || '',
            priority: data.priority || 'MEDIUM',
            appliedDate: data.appliedDate ? data.appliedDate.split('T')[0] : '',
            deadline: data.deadline ? data.deadline.split('T')[0] : '',
            description: data.description || '',
            requirements: data.requirements || '',
            notes: data.notes || '',
            contactName: data.contactName || '',
            contactEmail: data.contactEmail || '',
            contactPhone: data.contactPhone || '',
          })
          setFormInitialized(true)
        }
      } else if (response.status === 404) {
        setFetchError('Application not found')
      } else {
        setFetchError('Failed to load application')
      }
    } catch (error) {
      console.error('Error fetching application:', error)
      setFetchError('Failed to load application')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: UpdateJobFormData) => {
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

      const response = await fetch(`/api/jobs/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update application')
      }

      router.push(`/applications/${applicationId}`)
    } catch (error) {
      console.error('Error updating application:', error)
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
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

  if (fetchError) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{fetchError}</p>
          <Link
            href="/applications"
            className="text-blue-600 hover:text-blue-500"
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
          <p className="text-gray-500">Application not found</p>
          <Link
            href="/applications"
            className="text-blue-600 hover:text-blue-500"
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
        <div className="mb-6">
          <Link
            href={`/applications/${applicationId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Application
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Application</h1>
          <p className="text-gray-600">{application.position} at {application.company}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company *
                </label>
                <input
                  {...register('company')}
                  type="text"
                  id="company"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Google, Microsoft, Apple"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Position *
                </label>
                <input
                  {...register('position')}
                  type="text"
                  id="position"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Software Engineer, Product Manager"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  {...register('location')}
                  type="text"
                  id="location"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div>
                <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700">
                  Job URL
                </label>
                <input
                  {...register('jobUrl')}
                  type="url"
                  id="jobUrl"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://company.com/jobs/123"
                />
                {errors.jobUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobUrl.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                  Salary Range
                </label>
                <input
                  {...register('salary')}
                  type="text"
                  id="salary"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., $120k - $150k"
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  id="priority"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status & Job Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Status & Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">
                  Job Type
                </label>
                <select
                  {...register('jobType')}
                  id="jobType"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700">
                  Work Location
                </label>
                <select
                  {...register('workLocation')}
                  id="workLocation"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select work location</option>
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div>
                <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700">
                  Applied Date
                </label>
                <input
                  {...register('appliedDate')}
                  type="date"
                  id="appliedDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Application Deadline
                </label>
                <input
                  {...register('deadline')}
                  type="date"
                  id="deadline"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {showFollowUpReminder && (
                <div>
                  <label htmlFor="followUpReminder" className="block text-sm font-medium text-gray-700">
                    Follow-up Reminder
                  </label>
                  <input
                    {...register('followUpReminder')}
                    type="date"
                    id="followUpReminder"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Set a date to receive a follow-up reminder for this application
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the role and responsibilities..."
              />
            </div>

            <div className="mt-6">
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Requirements
              </label>
              <textarea
                {...register('requirements')}
                id="requirements"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Key requirements and qualifications..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                  Contact Name
                </label>
                <input
                  {...register('contactName')}
                  type="text"
                  id="contactName"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  {...register('contactEmail')}
                  type="email"
                  id="contactEmail"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@company.com"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  {...register('contactPhone')}
                  type="tel"
                  id="contactPhone"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                {...register('notes')}
                id="notes"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information, thoughts, or reminders about this application..."
              />
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-end space-x-4">
              <Link
                href={`/applications/${applicationId}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
