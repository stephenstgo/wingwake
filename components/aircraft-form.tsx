'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, X } from 'lucide-react'
import { createAircraftAction, updateAircraftAction } from '@/lib/actions/aircraft'
import { useToast } from '@/components/toast'
import type { Aircraft, InsertAircraft, UpdateAircraft } from '@/lib/types/database'
import type { Organization } from '@/lib/types/database'

interface AircraftFormProps {
  aircraft?: Aircraft | null
  organizations: Organization[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function AircraftForm({ aircraft, organizations, onSuccess, onCancel }: AircraftFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    n_number: aircraft?.n_number || '',
    manufacturer: aircraft?.manufacturer || '',
    model: aircraft?.model || '',
    serial_number: aircraft?.serial_number || '',
    year: aircraft?.year?.toString() || '',
    base_location: aircraft?.base_location || '',
    owner_id: aircraft?.owner_id || organizations[0]?.id || '',
  })
  const { success, error: showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const aircraftData: InsertAircraft | UpdateAircraft = {
        n_number: formData.n_number.trim().toUpperCase(),
        manufacturer: formData.manufacturer.trim() || null,
        model: formData.model.trim() || null,
        serial_number: formData.serial_number.trim() || null,
        year: formData.year ? parseInt(formData.year) : null,
        base_location: formData.base_location.trim() || null,
        owner_id: formData.owner_id || null,
      }

      let result
      if (aircraft) {
        result = await updateAircraftAction(aircraft.id, aircraftData)
        if (result) {
          success('Aircraft updated successfully')
        } else {
          showError('Failed to update aircraft')
        }
      } else {
        result = await createAircraftAction(aircraftData)
        if (result) {
          success('Aircraft created successfully')
        } else {
          showError('Failed to create aircraft')
        }
      }

      if (result) {
        if (onSuccess) {
          onSuccess()
        } else {
          // Default behavior: navigate to aircraft list
          router.push('/dashboard/aircraft')
          router.refresh()
        }
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          N-Number <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={formData.n_number}
          onChange={(e) => setFormData({ ...formData, n_number: e.target.value.toUpperCase() })}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border rounded-md bg-background"
          placeholder="N123AB"
          pattern="N[0-9A-Z]{1,5}[A-Z]{0,2}"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Format: N followed by numbers and letters (e.g., N123AB)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Manufacturer</label>
          <input
            type="text"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Cessna"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Model</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="172"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Serial Number</label>
          <input
            type="text"
            value={formData.serial_number}
            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="17212345"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Year</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            disabled={isSubmitting}
            min="1900"
            max={new Date().getFullYear() + 1}
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="2020"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Base Location</label>
        <input
          type="text"
          value={formData.base_location}
          onChange={(e) => setFormData({ ...formData, base_location: e.target.value })}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border rounded-md bg-background"
          placeholder="KORD"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Airport code or location name
        </p>
      </div>

      {organizations.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Owner Organization</label>
          <select
            value={formData.owner_id}
            onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="">No organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel()
            } else {
              // Default behavior: navigate to aircraft list
              router.push('/dashboard/aircraft')
            }
          }}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.n_number}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plane className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : aircraft ? 'Update Aircraft' : 'Create Aircraft'}
        </button>
      </div>
    </form>
  )
}
