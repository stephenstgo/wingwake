'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Plus, Trash2, Edit2 } from 'lucide-react'
import type { Discrepancy } from '@/lib/types/database'
import { createDiscrepancyAction, deleteDiscrepancyAction } from '@/lib/actions/discrepancies'
import { DiscrepancyForm } from './discrepancy-form'

interface DiscrepanciesListProps {
  flightId: string
  initialDiscrepancies: Discrepancy[]
}

export function DiscrepanciesList({ flightId, initialDiscrepancies }: DiscrepanciesListProps) {
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>(initialDiscrepancies)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAdd = async (data: {
    description: string
    severity: 'minor' | 'major' | 'critical'
    affects_flight: boolean
    affected_system?: string
  }) => {
    const newDiscrepancy = await createDiscrepancyAction({
      ferry_flight_id: flightId,
      ...data,
    })

    if (newDiscrepancy) {
      setDiscrepancies([...discrepancies, newDiscrepancy])
      setShowForm(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this discrepancy?')) {
      const success = await deleteDiscrepancyAction(id)
      if (success) {
        setDiscrepancies(discrepancies.filter(d => d.id !== id))
      }
    }
  }

  const severityColors = {
    minor: 'bg-yellow-100 text-yellow-700',
    major: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Discrepancies</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Discrepancy
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <DiscrepancyForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {discrepancies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No discrepancies added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discrepancies.map((discrepancy) => (
            <div
              key={discrepancy.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={severityColors[discrepancy.severity]}>
                      {discrepancy.severity}
                    </Badge>
                    {discrepancy.affects_flight && (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Affects Flight
                      </Badge>
                    )}
                    {discrepancy.affected_system && (
                      <Badge variant="outline">
                        {discrepancy.affected_system}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-900">{discrepancy.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Added {new Date(discrepancy.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(discrepancy.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete discrepancy"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

