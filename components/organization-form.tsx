'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, X } from 'lucide-react'
import { createOrganizationAction } from '@/lib/actions/organizations'
import { useToast } from '@/components/toast'
import type { OrganizationType } from '@/lib/types/database'

interface OrganizationFormProps {
  onSuccess?: (orgId: string) => void
  onCancel?: () => void
}

const ORGANIZATION_TYPES: { value: OrganizationType; label: string; description: string }[] = [
  { value: 'individual', label: 'Individual', description: 'Personal ownership' },
  { value: 'llc', label: 'LLC', description: 'Limited Liability Company' },
  { value: 'corporation', label: 'Corporation', description: 'Corporate entity' },
  { value: 'partnership', label: 'Partnership', description: 'Business partnership' },
]

export function OrganizationForm({ onSuccess, onCancel }: OrganizationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'individual' as OrganizationType,
  })
  const { success, error: showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createOrganizationAction({
        name: formData.name.trim(),
        type: formData.type,
      })

      if (result) {
        success('Organization created successfully')
        if (onSuccess) {
          onSuccess(result.id)
        } else {
          // Default behavior: reload the page to show the new organization
          router.refresh()
        }
      } else {
        showError('Failed to create organization')
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
          Organization Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border rounded-md bg-background"
          placeholder="My Aircraft Company"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Organization Type <span className="text-destructive">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as OrganizationType })}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          {ORGANIZATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          {isSubmitting ? 'Creating...' : 'Create Organization'}
        </button>
      </div>
    </form>
  )
}
