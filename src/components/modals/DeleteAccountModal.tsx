'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTheme } from '@/contexts/ThemeContext'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export default function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [error, setError] = useState('')
  const { isDark } = useTheme()
  const router = useRouter()

  const expectedConfirmation = 'DELETE MY ACCOUNT'

  const handleDeleteAccount = async () => {
    if (confirmationText !== expectedConfirmation) {
      setError('Please type the exact confirmation text to proceed')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        // Sign out the user and redirect to signin page
        await signOut({ redirect: false })
        router.push('/auth/signin?message=Account deleted successfully')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete account')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className={`relative z-50 inline-block align-bottom rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Delete Account
                  </h3>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className={`rounded-md p-2 hover:bg-opacity-20 hover:bg-gray-500 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'
                } disabled:opacity-50`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-2">
              <div className={`p-4 rounded-md border ${
                isDark 
                  ? 'bg-red-900/20 border-red-800' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className={`h-5 w-5 ${
                      isDark ? 'text-red-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      isDark ? 'text-red-200' : 'text-red-800'
                    }`}>
                      Warning: This action cannot be undone
                    </h3>
                    <div className={`mt-2 text-sm ${
                      isDark ? 'text-red-300' : 'text-red-700'
                    }`}>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your account will be permanently deleted</li>
                        <li>All job applications and data will be lost</li>
                        <li>Your analytics and settings will be removed</li>
                        <li>This action cannot be reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Account to be deleted: <span className="font-medium">{userEmail}</span>
                </p>
              </div>

              <div className="mt-4">
                <label htmlFor="confirmation" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  To confirm deletion, type <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-red-600 dark:text-red-400">DELETE MY ACCOUNT</span>
                </label>
                <input
                  id="confirmation"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  disabled={isDeleting}
                  placeholder="Type: DELETE MY ACCOUNT"
                  className={`mt-2 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:opacity-50 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {error && (
                <div className={`mt-4 p-3 rounded-md border ${
                  isDark 
                    ? 'bg-red-900/20 border-red-800 text-red-200' 
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmationText !== expectedConfirmation}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting Account...' : 'Delete My Account Permanently'}
            </button>
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${
                isDark 
                  ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
