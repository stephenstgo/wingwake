'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Loader2, X, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

interface DeleteFlightButtonProps {
  flightId: string
  tailNumber: string | null
}

export function DeleteFlightButton({ flightId, tailNumber }: DeleteFlightButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const expectedTailNumber = tailNumber || 'N/A'
  const isConfirmed = confirmationText.trim().toUpperCase() === expectedTailNumber.toUpperCase()

  const handleDelete = async () => {
    if (!isConfirmed) {
      setError('Tail number does not match')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/flights/${flightId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to dashboard after successful deletion
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.details || data.error || 'Failed to delete flight')
        setIsLoading(false)
      }
    } catch (error) {
      setError('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setIsLoading(false)
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setConfirmationText('')
    setError(null)
  }

  const handleCloseModal = useCallback(() => {
    if (!isLoading) {
      setIsModalOpen(false)
      setConfirmationText('')
      setError(null)
    }
  }, [isLoading])

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isModalOpen) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        handleCloseModal()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isModalOpen, isLoading, handleCloseModal])

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        <Trash2 className="w-4 h-4" />
        Delete Flight
      </button>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            // Close modal if clicking on the backdrop (not the card itself)
            if (e.target === e.currentTarget && !isLoading) {
              handleCloseModal()
            }
          }}
        >
          <Card 
            className="w-full max-w-md mx-4 p-6 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Delete Flight</h2>
                  <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-4">
                To confirm deletion, please enter the tail number <span className="font-semibold text-gray-900">{expectedTailNumber}</span> below:
              </p>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => {
                  setConfirmationText(e.target.value)
                  setError(null)
                }}
                placeholder="Enter tail number"
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isConfirmed || isLoading}
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
                    Delete Flight
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
