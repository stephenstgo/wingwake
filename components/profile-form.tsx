'use client'

import { useState } from 'react'
import { updateUserProfile } from '@/lib/actions/profile'
import { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types/database'

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await updateUserProfile({ full_name: fullName || null })

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={user.email || ''}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <input
          type="text"
          id="role"
          value={profile?.role || 'viewer'}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed capitalize"
        />
        <p className="mt-1 text-xs text-gray-500">Role is managed by administrators</p>
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
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
