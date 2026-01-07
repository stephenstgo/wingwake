'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeleteExampleFlightsButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('This will delete all example organizations, aircraft, and ferry flights. This action cannot be undone. Continue?')) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/delete-example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        const text = await response.text()
        throw new Error(`Failed to parse response: ${text}`)
      }

      if (response.ok) {
        setMessage(data.message || 'Example data deleted successfully!')
        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } else {
        // Build a comprehensive error message
        let errorMsg = data.error || 'Failed to delete example data'
        if (data.details) {
          errorMsg += `: ${data.details}`
        } else if (data.message) {
          errorMsg += `: ${data.message}`
        }
        
        // Log full error for debugging
        console.error('Delete error response:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
        })
        
        setMessage(errorMsg)
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Delete Example Data
          </>
        )}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}


