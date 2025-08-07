'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export default function PasswordResetModal({ isOpen, onClose, userEmail }: PasswordResetModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const { isDark } = useTheme()

  const sendResetEmail = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })

      if (response.ok) {
        setEmailSent(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setEmailSent(false)
    sendResetEmail()
  }

  const handleClose = () => {
    setEmailSent(false)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        {/* Subtle background overlay - much more transparent */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 transition-opacity z-40"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className={`relative z-50 inline-block align-bottom rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border ${
          isDark 
            ? 'bg-gray-800 border-gray-600 shadow-gray-900/50' 
            : 'bg-white border-gray-200 shadow-gray-500/50'
        }`}>
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Reset Password
              </h3>
              <button
                onClick={handleClose}
                className={`rounded-md p-2 hover:bg-opacity-20 hover:bg-gray-500 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              {!emailSent ? (
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    We'll send a password reset link to:
                  </p>
                  <p className={`mt-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {userEmail}
                  </p>
                  
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
              ) : (
                <div>
                  <div className={`p-4 rounded-md border ${
                    isDark 
                      ? 'bg-green-900/20 border-green-800' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className={`text-sm ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      ✅ Password reset link sent to {userEmail}
                    </p>
                  </div>
                  <p className={`mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Check your email and click the link to reset your password. The link will expire in 1 hour.
                  </p>
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Didn't receive the email? Check your spam folder or click resend below.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            {!emailSent ? (
              <>
                <button
                  onClick={sendResetEmail}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  onClick={handleClose}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Resend Email'}
                </button>
                <button
                  onClick={handleClose}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
