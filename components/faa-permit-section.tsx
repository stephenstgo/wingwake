'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileCheck, CheckCircle2, XCircle, Clock, Send } from 'lucide-react'
import type { FAAPermit } from '@/lib/types/database'
import { createPermitAction, submitPermitAction } from '@/lib/actions/faa-permits'
import { useRouter } from 'next/navigation'

interface FAAPermitSectionProps {
  flightId: string
  initialPermit?: FAAPermit
  flightStatus: string
}

export function FAAPermitSection({ flightId, initialPermit, flightStatus }: FAAPermitSectionProps) {
  const [permit, setPermit] = useState<FAAPermit | undefined>(initialPermit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const canSubmit = flightStatus === 'inspection_complete' && !permit

  const handleCreateAndSubmit = async () => {
    if (!confirm('Create and submit FAA permit application?')) return

    setIsSubmitting(true)

    // Create permit
      const newPermit = await createPermitAction({
      ferry_flight_id: flightId,
      status: 'draft',
    })

    if (newPermit) {
      // Immediately submit it
      const submitted = await submitPermitAction(newPermit.id, 'email')
      if (submitted) {
        setPermit(submitted)
        router.refresh()
      }
    }

    setIsSubmitting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'submitted':
        return <Clock className="w-5 h-5 text-purple-600" />
      default:
        return <FileCheck className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'denied':
        return 'bg-red-100 text-red-700'
      case 'submitted':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileCheck className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">FAA Permit</h2>
      </div>

      {permit ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(permit.status)}
            <Badge className={getStatusColor(permit.status)}>
              {permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
            </Badge>
          </div>

          {permit.submitted_at && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Submitted</p>
              <p className="font-medium text-gray-900">
                {new Date(permit.submitted_at).toLocaleDateString()}
                {permit.submitted_via && ` via ${permit.submitted_via}`}
              </p>
            </div>
          )}

          {permit.fsdo_mido && (
            <div>
              <p className="text-sm text-gray-500 mb-1">FSDO/MIDO</p>
              <p className="font-medium text-gray-900">{permit.fsdo_mido}</p>
            </div>
          )}

          {permit.approved_at && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Approved</p>
              <p className="font-medium text-gray-900">
                {new Date(permit.approved_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {permit.permit_number && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Permit Number</p>
              <p className="font-medium text-gray-900">{permit.permit_number}</p>
            </div>
          )}

          {permit.expires_at && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Expires</p>
              <p className="font-medium text-gray-900">
                {new Date(permit.expires_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {permit.limitations_text && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Operating Limitations</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{permit.limitations_text}</p>
            </div>
          )}

          {permit.faa_questions && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-700 mb-2">FAA Questions</p>
              <p className="text-sm text-yellow-800 whitespace-pre-wrap">{permit.faa_questions}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              No FAA permit has been created for this flight.
            </p>
            {canSubmit ? (
              <button
                onClick={handleCreateAndSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Create and Submit Permit Application'}
              </button>
            ) : (
              <p className="text-xs text-gray-500">
                Complete mechanic inspection before submitting to FAA.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

