'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  AlertTriangle, 
  UserCheck, 
  FileCheck, 
  Upload,
  Calendar,
  MapPin,
  Plane,
  Clock
} from 'lucide-react'
import type { FerryFlightWithRelations } from '@/lib/types/database'
import { DiscrepanciesList } from './discrepancies-list'
import { MechanicSignoffForm } from './mechanic-signoff-form'
import { FAAPermitSection } from './faa-permit-section'
import { DocumentsList } from './documents-list'
import { StatusBadge } from './status-badge'

interface FerryFlightDetailProps {
  flight: FerryFlightWithRelations
}

export function FerryFlightDetail({ flight }: FerryFlightDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {flight.origin} → {flight.destination}
              </h1>
              <StatusBadge status={flight.status} />
            </div>
            {flight.purpose && (
              <p className="text-lg text-gray-600 mb-2">{flight.purpose}</p>
            )}
          </div>
        </div>

        {/* Flight Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {flight.aircraft && (
            <div className="flex items-start gap-3">
              <Plane className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Aircraft</p>
                <p className="font-medium text-gray-900">
                  {flight.aircraft.n_number}
                  {flight.aircraft.model && ` • ${flight.aircraft.model}`}
                </p>
              </div>
            </div>
          )}
          {flight.planned_departure && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Planned Departure</p>
                <p className="font-medium text-gray-900">
                  {new Date(flight.planned_departure).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          {flight.owner && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium text-gray-900">{flight.owner.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discrepancies">
            Discrepancies
            {flight.discrepancies && flight.discrepancies.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {flight.discrepancies.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="signoff">Sign-off</TabsTrigger>
          <TabsTrigger value="permit">FAA Permit</TabsTrigger>
          <TabsTrigger value="documents">
            Documents
            {flight.documents && flight.documents.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {flight.documents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Flight Overview</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Origin</p>
                  <p className="font-medium text-gray-900">{flight.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Destination</p>
                  <p className="font-medium text-gray-900">{flight.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <StatusBadge status={flight.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(flight.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {flight.pilot && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-1">Assigned Pilot</p>
                  <p className="font-medium text-gray-900">
                    {flight.pilot.full_name || flight.pilot.email}
                  </p>
                </div>
              )}

              {flight.mechanic && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-1">Assigned Mechanic</p>
                  <p className="font-medium text-gray-900">
                    {flight.mechanic.full_name || flight.mechanic.email}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="discrepancies" className="mt-6">
          <DiscrepanciesList flightId={flight.id} initialDiscrepancies={flight.discrepancies || []} />
        </TabsContent>

        <TabsContent value="signoff" className="mt-6">
          <MechanicSignoffForm 
            flightId={flight.id} 
            initialSignoffs={flight.mechanic_signoffs || []}
            canSignOff={flight.status === 'inspection_pending' || flight.status === 'draft'}
          />
        </TabsContent>

        <TabsContent value="permit" className="mt-6">
          <FAAPermitSection 
            flightId={flight.id}
            initialPermit={flight.faa_permits?.[0]}
            flightStatus={flight.status}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsList 
            flightId={flight.id}
            initialDocuments={flight.documents || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}


