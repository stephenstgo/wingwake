'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { UserCheck, CheckCircle2 } from 'lucide-react'
import type { MechanicSignoff } from '@/lib/types/database'
import { createSignoffAction } from '@/lib/actions/mechanic-signoffs'
import { useRouter } from 'next/navigation'

interface MechanicSignoffFormProps {
  flightId: string
  initialSignoffs: MechanicSignoff[]
  canSignOff: boolean
}

export function MechanicSignoffForm({ flightId, initialSignoffs, canSignOff }: MechanicSignoffFormProps) {
  const [signoffs, setSignoffs] = useState<MechanicSignoff[]>(initialSignoffs)
  const [statement, setStatement] = useState('')
  const [limitations, setLimitations] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const latestSignoff = signoffs.length > 0 ? signoffs[0] : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const newSignoff = await createSignoffAction({
      ferry_flight_id: flightId,
      statement,
      limitations: limitations || null,
    })

    if (newSignoff) {
      setSignoffs([newSignoff, ...signoffs])
      setStatement('')
      setLimitations('')
      router.refresh() // Refresh to update flight status
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserCheck className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">Mechanic Sign-off</h2>
      </div>

      {latestSignoff ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900 mb-2">Sign-off Complete</p>
              <p className="text-sm text-green-800 mb-3">{latestSignoff.statement}</p>
              {latestSignoff.limitations && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-1">Recommended Limitations:</p>
                  <p className="text-sm text-green-800">{latestSignoff.limitations}</p>
                </div>
              )}
              <p className="text-xs text-green-600 mt-3">
                Signed on {new Date(latestSignoff.signed_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            No mechanic sign-off has been completed for this flight.
          </p>
        </div>
      )}

      {canSignOff && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Safety Statement *
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="I certify that this aircraft is safe for the intended ferry flight..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommended Operating Limitations (optional)
            </label>
            <textarea
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="e.g., Day VFR only, no passengers, maintain altitude below 5,000 MSL"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Sign-off'}
          </button>
        </form>
      )}

      {!canSignOff && latestSignoff && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Flight status must be "Inspection Pending" or "Draft" to add a new sign-off.
          </p>
        </div>
      )}
    </Card>
  )
}

