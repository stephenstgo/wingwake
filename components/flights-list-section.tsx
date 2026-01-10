"use client"

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { StatusBadge } from '@/components/status-badge'
import type { FerryFlightStatus } from '@/lib/types/database'
import { processPhases, getCurrentPhaseIndex } from '@/lib/data/phase-definitions'

interface Flight {
  id: string
  tail_number?: string | null
  origin: string
  destination: string
  status: string
  actual_arrival?: string | null
  created_at?: string | null
  updated_at?: string | null
  aircraft?: {
    n_number?: string | null
    model?: string | null
  } | null
}

interface FlightsListSectionProps {
  title: string
  flights: Flight[]
  defaultOpen?: boolean
}

type TimeFilter = 'all' | '7d' | '30d' | '90d' | '6m' | '1y'
type SortField = 'created_at' | 'updated_at' | 'tail_number' | 'origin' | 'destination' | 'status' | 'actual_arrival'
type SortOrder = 'asc' | 'desc'

export function FlightsListSection({ title, flights, defaultOpen = true }: FlightsListSectionProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [sortField, setSortField] = useState<SortField>(title === 'Completed Flights' ? 'actual_arrival' : 'updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [openValue, setOpenValue] = useState<string[]>(defaultOpen ? [title] : [])

  // Update openValue when defaultOpen prop changes
  useEffect(() => {
    setOpenValue(defaultOpen ? [title] : [])
  }, [defaultOpen, title])

  const filteredAndSortedFlights = useMemo(() => {
    // First apply time filter
    let filtered = flights
    if (timeFilter !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()

      switch (timeFilter) {
        case '7d':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case '30d':
          cutoffDate.setDate(now.getDate() - 30)
          break
        case '90d':
          cutoffDate.setDate(now.getDate() - 90)
          break
        case '6m':
          cutoffDate.setMonth(now.getMonth() - 6)
          break
        case '1y':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = flights.filter(flight => {
        // For completed flights, use actual_arrival or updated_at
        // For other flights, use created_at or updated_at
        const dateToCheck = flight.actual_arrival 
          ? new Date(flight.actual_arrival)
          : flight.updated_at 
          ? new Date(flight.updated_at)
          : flight.created_at 
          ? new Date(flight.created_at)
          : null

        if (!dateToCheck) return false
        return dateToCheck >= cutoffDate
      })
    }

    // Then apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number | null = null
      let bValue: string | number | null = null

      switch (sortField) {
        case 'created_at':
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0
          break
        case 'updated_at':
          aValue = a.updated_at ? new Date(a.updated_at).getTime() : 0
          bValue = b.updated_at ? new Date(b.updated_at).getTime() : 0
          break
        case 'actual_arrival':
          aValue = a.actual_arrival ? new Date(a.actual_arrival).getTime() : 0
          bValue = b.actual_arrival ? new Date(b.actual_arrival).getTime() : 0
          break
        case 'tail_number':
          aValue = (a.tail_number || a.aircraft?.n_number || '').toUpperCase()
          bValue = (b.tail_number || b.aircraft?.n_number || '').toUpperCase()
          break
        case 'origin':
          aValue = a.origin.toUpperCase()
          bValue = b.origin.toUpperCase()
          break
        case 'destination':
          aValue = a.destination.toUpperCase()
          bValue = b.destination.toUpperCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
      }

      if (aValue === null || aValue === '') return 1
      if (bValue === null || bValue === '') return -1

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      const aStr = String(aValue)
      const bStr = String(bValue)
      if (sortOrder === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })

    return sorted
  }, [flights, timeFilter, sortField, sortOrder])

  if (flights.length === 0) return null

  return (
    <Accordion 
      type="multiple" 
      value={openValue} 
      onValueChange={setOpenValue}
      className="w-full"
    >
      <AccordionItem value={title} className="border-none">
        <div className="flex items-center justify-between mb-4">
          <AccordionTrigger className="text-2xl font-bold text-gray-900 hover:no-underline py-2 [&>svg]:size-5 [&>svg]:translate-y-0 [&]:items-center">
            <div className="flex items-center gap-3">
              <span>{title}</span>
              <span className="text-base font-normal text-gray-500">
                ({filteredAndSortedFlights.length})
              </span>
            </div>
          </AccordionTrigger>
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {title === 'Completed Flights' && (
                <option value="actual_arrival">Arrival Date</option>
              )}
              <option value="updated_at">Last Updated</option>
              <option value="created_at">Date Created</option>
              <option value="tail_number">Tail Number</option>
              <option value="origin">Origin</option>
              <option value="destination">Destination</option>
              <option value="status">Status</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
        <AccordionContent>
          <div className="space-y-3">
            {filteredAndSortedFlights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No flights found for the selected time period.
              </div>
            ) : (
              filteredAndSortedFlights.map((flight) => {
                const tailNumber = flight.tail_number || flight.aircraft?.n_number || 'N/A'
                const aircraftModel = flight.aircraft?.model || ''
                const currentPhaseIndex = getCurrentPhaseIndex(flight.status as FerryFlightStatus)
                
                return (
                  <Link
                    key={flight.id}
                    href={`/dashboard/flights/${flight.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-gray-900">
                              {tailNumber}
                            </h3>
                            {aircraftModel && (
                              <>
                                <span className="text-base text-gray-900">•</span>
                                <span className="text-base text-gray-900">{aircraftModel}</span>
                                <span className="text-base text-gray-900">•</span>
                                <span className="text-base text-gray-900">{flight.origin} → {flight.destination}</span>
                              </>
                            )}
                            {!aircraftModel && (
                              <>
                                <span className="text-base text-gray-900">•</span>
                                <span className="text-base text-gray-900">{flight.origin} → {flight.destination}</span>
                              </>
                            )}
                          </div>
                          <StatusBadge status={flight.status as any} />
                        </div>
                        {/* Timeline Progress Indicator */}
                        <div className={`relative ${title === 'Completed Flights' ? 'pb-8' : 'pb-5'}`}>
                          <div className="flex items-center">
                            {processPhases.map((phase, index) => {
                              const isCompleted = title === 'Completed Flights' 
                                ? index <= currentPhaseIndex 
                                : index < currentPhaseIndex
                              const isCurrent = index === currentPhaseIndex && title !== 'Completed Flights'
                              const prevPhaseCompleted = index > 0 && index <= currentPhaseIndex
                              const isSegmentCompleted = title === 'Completed Flights' 
                                ? index > 0 && index <= currentPhaseIndex
                                : prevPhaseCompleted
                              
                              return (
                                <div key={phase.id} className={`flex items-center ${index === 0 ? 'shrink-0' : 'flex-1'}`}>
                                  {/* Progress line segment before dot */}
                                  {index > 0 && (
                                    <div 
                                      className={`flex-1 h-1 rounded-full transition-colors ${
                                        isSegmentCompleted ? 'bg-green-500' : 'bg-gray-200'
                                      }`}
                                      style={{ minWidth: title === 'Completed Flights' ? '15px' : '20px', flex: '1 1 0%' }}
                                    />
                                  )}
                                  {/* Phase dot at end of segment */}
                                  <div className={`relative shrink-0 flex flex-col items-center ${isCurrent ? 'w-4 h-4' : title === 'Completed Flights' ? 'w-3 h-3' : 'w-2.5 h-2.5'}`}>
                                    <div className={`relative ${isCurrent ? 'w-4 h-4' : title === 'Completed Flights' ? 'w-3 h-3' : 'w-2.5 h-2.5'} rounded-full transition-colors ${
                                      isCompleted ? 'bg-green-500' : 
                                      isCurrent ? 'bg-green-500 ring-1.5 ring-green-300 ring-offset-1' : 
                                      'bg-gray-300'
                                    }`}>
                                      {isCurrent && (
                                        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse" />
                                      )}
                                    </div>
                                    {/* Phase label under current dot */}
                                    {isCurrent && (
                                      <div className={`absolute top-full mt-1 whitespace-nowrap ${currentPhaseIndex === 0 ? 'left-0' : ''}`}>
                                        <span className="text-xs font-medium text-gray-900">
                                          {processPhases[currentPhaseIndex].label}
                                        </span>
                                      </div>
                                    )}
                                    {title === 'Completed Flights' && index === currentPhaseIndex && flight.actual_arrival && (
                                      <div className="absolute top-full mt-1 whitespace-nowrap flex flex-col items-end right-0">
                                        <span className="text-xs font-medium text-gray-900">
                                          {processPhases[currentPhaseIndex].label}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(flight.actual_arrival).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
