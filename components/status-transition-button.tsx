'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { transitionFlightStatus } from '@/lib/actions/status-transitions'
import { isValidTransition, getValidNextStatuses, getStatusDisplayName } from '@/lib/utils/status-transitions'
import type { FerryFlightStatus } from '@/lib/types/database'
import { useToast } from '@/components/toast'

interface StatusTransitionButtonProps {
  flightId: string
  currentStatus: FerryFlightStatus
  targetStatus: FerryFlightStatus
  label?: string
  className?: string
  onSuccess?: () => void
}

export function StatusTransitionButton({
  flightId,
  currentStatus,
  targetStatus,
  label,
  className = '',
  onSuccess,
}: StatusTransitionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { success, error: showError } = useToast()

  // Check if transition is valid
  const isValid = isValidTransition(currentStatus, targetStatus)
  const displayLabel = label || getStatusDisplayName(targetStatus)

  const handleClick = async () => {
    if (!isValid) {
      showError(`Cannot transition from ${getStatusDisplayName(currentStatus)} to ${displayLabel}`)
      return
    }

    setIsLoading(true)

    try {
      const result = await transitionFlightStatus(flightId, targetStatus, currentStatus)

      if (result.success) {
        success(`Flight status updated to ${displayLabel}`)
        router.refresh()
        onSuccess?.()
      } else {
        showError(result.error || 'Failed to update status')
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValid) {
    return null // Don't show invalid transitions
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? 'Updating...' : displayLabel}
    </button>
  )
}

interface StatusTransitionMenuProps {
  flightId: string
  currentStatus: FerryFlightStatus
  onStatusChange?: () => void
}

export function StatusTransitionMenu({
  flightId,
  currentStatus,
  onStatusChange,
}: StatusTransitionMenuProps) {
  const validNextStatuses = getValidNextStatuses(currentStatus)

  if (validNextStatuses.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No status transitions available (terminal state)
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {validNextStatuses.map((status) => (
        <StatusTransitionButton
          key={status}
          flightId={flightId}
          currentStatus={currentStatus}
          targetStatus={status}
          onSuccess={onStatusChange}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        />
      ))}
    </div>
  )
}
