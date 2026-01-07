'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface DiscrepancyFormProps {
  onSubmit: (data: {
    description: string
    severity: 'minor' | 'major' | 'critical'
    affects_flight: boolean
    affected_system?: string
  }) => void
  onCancel: () => void
}

export function DiscrepancyForm({ onSubmit, onCancel }: DiscrepancyFormProps) {
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical'>('major')
  const [affectsFlight, setAffectsFlight] = useState(true)
  const [affectedSystem, setAffectedSystem] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      description,
      severity,
      affects_flight: affectsFlight,
      affected_system: affectedSystem || undefined,
    })
    setDescription('')
    setSeverity('major')
    setAffectsFlight(true)
    setAffectedSystem('')
  }

  return (
    <Card className="p-4 border-2 border-dashed border-gray-300">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Describe the discrepancy..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity *
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as 'minor' | 'major' | 'critical')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="minor">Minor</option>
            <option value="major">Major</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Affected System (optional)
          </label>
          <input
            type="text"
            value={affectedSystem}
            onChange={(e) => setAffectedSystem(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="e.g., powerplant, flight_controls, navigation"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="affects-flight"
            checked={affectsFlight}
            onCheckedChange={(checked) => setAffectsFlight(checked === true)}
          />
          <label htmlFor="affects-flight" className="text-sm text-gray-700">
            This discrepancy affects the flight
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            Add Discrepancy
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  )
}


