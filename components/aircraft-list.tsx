'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, Edit, Trash2, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { deleteAircraftAction } from '@/lib/actions/aircraft'
import { useToast } from '@/components/toast'
import type { Aircraft } from '@/lib/types/database'
import type { Organization } from '@/lib/types/database'

interface AircraftListProps {
  initialAircraft: Aircraft[]
  organizations: Organization[]
}

export function AircraftList({ initialAircraft, organizations }: AircraftListProps) {
  const [aircraft, setAircraft] = useState<Aircraft[]>(initialAircraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const router = useRouter()
  const { success, error: showError } = useToast()

  const handleDelete = async (id: string, nNumber: string) => {
    if (!confirm(`Are you sure you want to delete aircraft ${nNumber}?`)) {
      return
    }

    const result = await deleteAircraftAction(id)
    if (result.success) {
      setAircraft(aircraft.filter(a => a.id !== id))
      success('Aircraft deleted successfully')
      router.refresh()
    } else {
      showError('Failed to delete aircraft')
    }
  }

  const getOwnerName = (ownerId: string | null) => {
    if (!ownerId) return 'No owner'
    const org = organizations.find(o => o.id === ownerId)
    return org?.name || 'Unknown'
  }

  if (aircraft.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Plane className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No aircraft registered</h3>
        <p className="text-gray-600 mb-6">
          Get started by adding your first aircraft to the registry.
        </p>
        <a
          href="/dashboard/aircraft/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plane className="w-4 h-4" />
          Add Your First Aircraft
        </a>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {aircraft.map((ac) => (
        <Card key={ac.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{ac.n_number}</h3>
              {ac.manufacturer && ac.model && (
                <p className="text-sm text-gray-600">
                  {ac.manufacturer} {ac.model}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/aircraft/${ac.id}/edit`)}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Edit aircraft"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(ac.id, ac.n_number)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete aircraft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {ac.serial_number && (
              <div className="flex justify-between">
                <span className="text-gray-500">Serial:</span>
                <span className="text-gray-900">{ac.serial_number}</span>
              </div>
            )}
            {ac.year && (
              <div className="flex justify-between">
                <span className="text-gray-500">Year:</span>
                <span className="text-gray-900">{ac.year}</span>
              </div>
            )}
            {ac.base_location && (
              <div className="flex justify-between">
                <span className="text-gray-500">Base:</span>
                <span className="text-gray-900">{ac.base_location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Owner:</span>
              <span className="text-gray-900">{getOwnerName(ac.owner_id)}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
