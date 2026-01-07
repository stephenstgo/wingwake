'use client'

import { useState } from 'react'
import { Database, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SeedExampleFlightsButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSeed = async () => {
    if (!confirm('This will create 9 example organizations, aircraft, and ferry flights. Continue?')) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/seed', {
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
        setMessage(data.message || 'Example data created successfully!')
        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } else {
        // Build a comprehensive error message
        let errorMsg = data.error || 'Failed to create example data'
        if (data.details) {
          errorMsg += `: ${data.details}`
        } else if (data.message) {
          errorMsg += `: ${data.message}`
        }
        
        // Log full error for debugging
        console.error('Seed error response:', {
          status: response.status,
          statusText: response.statusText,
          statusCode: response.status,
          data: data,
          error: data.error,
          details: data.details,
          message: data.message,
          code: data.code,
          fullResponse: JSON.stringify(data, null, 2)
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
        onClick={handleSeed}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            Load Example Data
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

