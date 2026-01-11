'use client'

import { useState } from 'react'
import { Building2, Plus } from 'lucide-react'
import { OrganizationForm } from '@/components/organization-form'
import { Card } from '@/components/ui/card'

interface OrganizationManagementProps {
  organizations: any[]
  onCreateSuccess?: () => void
}

export function OrganizationManagement({ organizations, onCreateSuccess }: OrganizationManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)

  if (organizations.length === 0 && !showCreateForm) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Organization</h3>
          <p className="text-gray-600 mb-6">
            Create an organization to manage your aircraft and ferry flights.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </button>
        </div>
      </Card>
    )
  }

  if (showCreateForm) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create Organization</h2>
        <OrganizationForm
          onSuccess={(orgId) => {
            setShowCreateForm(false)
            onCreateSuccess?.()
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      </Card>
    )
  }

  return null
}
