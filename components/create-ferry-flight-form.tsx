'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { createFerryFlightAction } from '@/lib/actions/ferry-flights'
import { findOrCreateOrganization } from '@/lib/actions/organizations'
import type { Organization, Aircraft } from '@/lib/types/database'

interface CreateFerryFlightFormProps {
  organizations: Organization[]
  aircraft: Aircraft[]
}

export function CreateFerryFlightForm({ organizations, aircraft }: CreateFerryFlightFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    aircraft_id: '',
    tail_number: '',
    owner_name: '',
    origin: '',
    destination: '',
    purpose: '',
    planned_departure: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.origin || !formData.destination) {
      alert('Please fill in origin and destination')
      return
    }
    
    setIsSubmitting(true)

    try {
      // Find or create the organization if a name was provided
      let ownerId: string | null = null
      if (formData.owner_name && formData.owner_name.trim() !== '') {
        ownerId = await findOrCreateOrganization(formData.owner_name.trim())
        if (!ownerId) {
          alert('Failed to create or find organization. Please try again.')
          setIsSubmitting(false)
          return
        }
      }

      const flight = await createFerryFlightAction({
        aircraft_id: formData.aircraft_id || null,
        tail_number: formData.tail_number || null,
        owner_id: ownerId,
        origin: formData.origin,
        destination: formData.destination,
        purpose: formData.purpose || null,
        planned_departure: formData.planned_departure || null,
        status: 'draft',
      })

      if (flight) {
        router.push(`/dashboard/flights/${flight.id}`)
      } else {
        alert('Failed to create ferry flight. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error creating ferry flight:', error)
      alert(error instanceof Error ? error.message : 'Failed to create ferry flight. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner/Organization (optional)
          </label>
          <input
            type="text"
            value={formData.owner_name}
            onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
            placeholder="Enter organization name (will be created if it doesn't exist)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            If the organization doesn't exist, it will be created automatically and you'll be added as the owner.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aircraft (optional)
            </label>
            <select
              value={formData.aircraft_id}
              onChange={(e) => {
                const selectedAircraft = aircraft.find(ac => ac.id === e.target.value)
                setFormData({ 
                  ...formData, 
                  aircraft_id: e.target.value,
                  tail_number: selectedAircraft?.n_number || formData.tail_number
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select aircraft...</option>
              {aircraft.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.manufacturer && ac.model 
                    ? `${ac.manufacturer} ${ac.model}` 
                    : ac.model || ac.manufacturer || 'Aircraft'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tail Number (optional)
            </label>
            <input
              type="text"
              value={formData.tail_number}
              onChange={(e) => setFormData({ ...formData, tail_number: e.target.value.toUpperCase() })}
              placeholder="N123AB"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin Airport *
            </label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
              required
              placeholder="KORD"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Airport *
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
              required
              placeholder="KLAX"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose (optional)
          </label>
          <select
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">Select purpose...</option>
            <option value="Repositioning to a maintenance facility">Repositioning to a maintenance facility</option>
            <option value="Returning to base">Returning to base</option>
            <option value="Export/import delivery">Export/import delivery</option>
            <option value="Storage relocation">Storage relocation</option>
            <option value="Weighing or modifications">Weighing or modifications</option>
            <option value="Flight testing after major repairs or modifications">Flight testing after major repairs or modifications</option>
            <option value="Delivery to new owner (domestic sale)">Delivery to new owner (domestic sale)</option>
            <option value="Moving to paint facility">Moving to paint facility</option>
            <option value="Moving to avionics shop">Moving to avionics shop</option>
            <option value="Moving to annual inspection location">Moving to annual inspection location</option>
            <option value="Pre-purchase inspection">Pre-purchase inspection</option>
            <option value="Moving to different FBO or hangar">Moving to different FBO or hangar</option>
            <option value="Repositioning for charter or lease operations">Repositioning for charter or lease operations</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planned Departure Date (optional)
          </label>
          <input
            type="date"
            value={formData.planned_departure}
            onChange={(e) => setFormData({ ...formData, planned_departure: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Ferry Flight'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  )
}

