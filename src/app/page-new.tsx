'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { BriefcaseIcon, ChartBarIcon, ClockIcon, DocumentIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect to dashboard
  }

  const features = [
    {
      icon: BriefcaseIcon,
      title: 'Track Applications',
      description: 'Keep track of all your job applications in one place with detailed status updates.',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Get insights into your job search progress with comprehensive analytics.',
    },
    {
      icon: ClockIcon,
      title: 'Reminders',
      description: 'Never miss a follow-up or interview with smart reminders and notifications.',
    },
    {
      icon: DocumentIcon,
      title: 'Document Management',
      description: 'Upload and organize your resumes, cover letters, and other documents.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">JobTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-500 hover:text-gray-700"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Track Your Job Search
              <span className="text-blue-600"> Like a Pro</span>
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Keep track of your job applications, interviews, and opportunities all in one place. 
              Get insights and never miss a follow-up again.
            </p>
            <div className="mt-8">
              <Link
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Tracking For Free
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Everything you need to manage your job search
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                From application tracking to interview scheduling, we've got you covered.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-blue-200">Create your account today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
