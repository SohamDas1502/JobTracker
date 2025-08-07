'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { UserCircleIcon, ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'

const updateProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
})

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: string
}

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const { profile, loading, updateProfile } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    // Populate form with existing data when profile is loaded
    if (profile) {
      setImagePreview(profile.image)
      reset({
        name: profile.name || '',
        email: profile.email || '',
      })
    }
  }, [session, status, router, profile, reset])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please select a valid image file')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image file size must be less than 5MB')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.imageUrl
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const onSubmit = async (data: UpdateProfileFormData) => {
    setIsSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      let imageUrl = profile?.image

      // Upload image if a new one was selected
      if (selectedImage) {
        setIsUploadingImage(true)
        imageUrl = await uploadImage(selectedImage)
        setIsUploadingImage(false)
      }

      // Update profile data
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          image: imageUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedProfile = await response.json()
      
      // Update the UserContext with the new profile data
      updateProfile(updatedProfile)

      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (error) {
      console.error('Error updating profile:', error)
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
      setIsUploadingImage(false)
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
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your account information and profile picture</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Picture */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h2>
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <img
                    className="h-24 w-24 rounded-full object-cover"
                    src={imagePreview}
                    alt="Profile preview"
                  />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    Choose Photo
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  {(imagePreview || profile.image) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                      }}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove Photo
                    </button>
                  )}
                  {imagePreview && imagePreview !== profile.image && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(profile.image)
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  JPG, GIF or PNG. 5MB max.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information (Read-only) */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-sm text-gray-500 bg-gray-50 rounded-md px-3 py-2 font-mono">
                  {profile.id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

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
                href="/profile"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (isUploadingImage ? 'Uploading...' : 'Updating...') : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
