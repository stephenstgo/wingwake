'use client'

import { useState } from 'react'
import { updatePassword } from '@/lib/actions/profile'

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validation
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setLoading(false)
      return
    }

    const result = await updatePassword(currentPassword, newPassword)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}
