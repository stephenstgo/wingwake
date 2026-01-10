'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'
import type { FerryFlightStatus } from '@/lib/types/database'
import { getCurrentPhaseIndex } from '@/lib/data/phase-definitions'

interface StatusData {
  name: string
  value: number
  status: string
}

interface TimeSeriesData {
  month: string
  count: number
}

interface FlightDateData {
  created_at: string | null
  actual_arrival: string | null
  updated_at: string | null
  status: string | null
}

interface DashboardChartsProps {
  statusData: StatusData[]
  flightsOverTime: TimeSeriesData[]
  completedOverTime: TimeSeriesData[]
  allFlights: FlightDateData[]
}

// Helper function to get sort order for statuses (chronological order)
// Based on processPhases order: documentation -> inspection -> faa_review -> permit_approved -> ready_to_fly -> in_flight -> completed
const getStatusOrder = (status: string): number => {
  const statusOrder: Record<string, number> = {
    'draft': 1,
    'denied': 2,
    'inspection_pending': 3,
    'inspection_complete': 4,
    'faa_submitted': 5,
    'faa_questions': 6,
    'permit_issued': 7,
    'scheduled': 8,
    'in_progress': 9,
    'completed': 10,
    'aborted': 11,
  }
  return statusOrder[status] || 999
}

type TimeRange = '3' | '6' | '12' | 'all'

const COLORS = {
  active: '#0ea5e9', // sky-500
  pending: '#f97316', // orange-500
  completed: '#22c55e', // green-500
  draft: '#94a3b8', // slate-400
  inProgress: '#3b82f6', // blue-500
  permitIssued: '#8b5cf6', // violet-500
  default: '#64748b' // slate-500
}

// Status configuration matching status-badge.tsx
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#94a3b8' }, // slate-400
  inspection_pending: { label: 'Inspection Pending', color: '#fbbf24' }, // amber-400
  inspection_complete: { label: 'Inspection Complete', color: '#3b82f6' }, // blue-500
  faa_submitted: { label: 'FAA Submitted', color: '#a855f7' }, // purple-500
  faa_questions: { label: 'FAA Questions', color: '#f97316' }, // orange-500
  permit_issued: { label: 'Permit Issued', color: '#8b5cf6' }, // violet-500
  scheduled: { label: 'Scheduled', color: '#0ea5e9' }, // sky-500
  in_progress: { label: 'In Progress', color: '#6366f1' }, // indigo-500
  completed: { label: 'Completed', color: '#22c55e' }, // green-500
  aborted: { label: 'Aborted', color: '#ef4444' }, // red-500
  denied: { label: 'Denied', color: '#ef4444' }, // red-500
}

const getStatusColor = (status: string): string => {
  return statusConfig[status]?.color || COLORS.default
}

const getStatusLabel = (status: string): string => {
  return statusConfig[status]?.label || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function DashboardCharts({ statusData, flightsOverTime, completedOverTime, allFlights }: DashboardChartsProps) {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<TimeRange>('6')
  const [completedTimeRange, setCompletedTimeRange] = useState<TimeRange>('6')
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<string>>(new Set(['completed', 'aborted']))

  // Generate months based on selected time range for flights created
  const months = useMemo(() => {
    const now = new Date()
    const rangeMonths = timeRange === 'all' ? 24 : parseInt(timeRange)
    const monthsArray = []
    for (let i = rangeMonths - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      monthsArray.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        date
      })
    }
    return monthsArray
  }, [timeRange])

  // Generate months based on selected time range for completed flights
  const completedMonths = useMemo(() => {
    const now = new Date()
    const rangeMonths = completedTimeRange === 'all' ? 24 : parseInt(completedTimeRange)
    const monthsArray = []
    for (let i = rangeMonths - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      monthsArray.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        date
      })
    }
    return monthsArray
  }, [completedTimeRange])

  // Filter and process flights over time based on selected range
  const filteredFlightsOverTime = useMemo(() => {
    return months.map(({ month, monthKey }) => {
      const count = allFlights.filter(flight => {
        if (!flight.created_at) return false
        const flightDate = new Date(flight.created_at)
        const flightMonthKey = `${flightDate.getFullYear()}-${String(flightDate.getMonth() + 1).padStart(2, '0')}`
        return flightMonthKey === monthKey
      }).length
      return { month, count, monthKey }
    })
  }, [months, allFlights])

  // Filter and process completed flights over time based on selected range
  const filteredCompletedOverTime = useMemo(() => {
    return completedMonths.map(({ month, monthKey }) => {
      const count = allFlights.filter(flight => {
        // Only count flights with status 'completed'
        if (flight.status !== 'completed') return false
        const dateStr = flight.actual_arrival || flight.updated_at
        if (!dateStr) return false
        const flightDate = new Date(dateStr)
        const flightMonthKey = `${flightDate.getFullYear()}-${String(flightDate.getMonth() + 1).padStart(2, '0')}`
        return flightMonthKey === monthKey
      }).length
      return { month, count, monthKey }
    })
  }, [completedMonths, allFlights])

  // Helper function to map status to section
  const getStatusSection = (status: string): string => {
    const statusLower = status.toLowerCase()
    if (['scheduled', 'in_progress', 'permit_issued'].includes(statusLower)) {
      return 'active'
    }
    if (['draft', 'inspection_pending', 'inspection_complete', 'faa_submitted', 'faa_questions', 'denied'].includes(statusLower)) {
      return 'pending'
    }
    if (['completed', 'aborted'].includes(statusLower)) {
      return 'completed'
    }
    return 'active' // default
  }

  // Handle pie chart click (Flights by Status)
  const handlePieClick = (_: any, index: number) => {
    const data = visibleStatusData[index]
    if (data && data.status) {
      const section = getStatusSection(data.status)
      router.push(`/dashboard/flights?section=${section}&status=${encodeURIComponent(data.status)}`)
    }
  }

  // Handle line chart click (Flights Created)
  const handleLineClick = (data: any) => {
    if (data && data.monthKey) {
      router.push(`/dashboard/flights?createdMonth=${data.monthKey}`)
    }
  }

  // Handle bar chart click (Completed Flights)
  const handleBarClick = (data: any) => {
    if (data && data.monthKey) {
      router.push(`/dashboard/flights?section=completed&completedMonth=${data.monthKey}`)
    }
  }

  // Sort and filter status data based on hidden statuses
  const visibleStatusData = useMemo(() => {
    const filtered = statusData.filter(entry => !hiddenStatuses.has(entry.status))
    // Sort by chronological order
    return filtered.sort((a, b) => {
      return getStatusOrder(a.status) - getStatusOrder(b.status)
    })
  }, [statusData, hiddenStatuses])

  // Sort all status data for display in the list (even hidden ones)
  const sortedStatusData = useMemo(() => {
    return [...statusData].sort((a, b) => {
      return getStatusOrder(a.status) - getStatusOrder(b.status)
    })
  }, [statusData])

  // Split statuses into two columns for vertical-first display
  const statusColumns = useMemo(() => {
    const midPoint = Math.ceil(sortedStatusData.length / 2)
    return [
      sortedStatusData.slice(0, midPoint),
      sortedStatusData.slice(midPoint)
    ]
  }, [sortedStatusData])

  // Toggle status visibility
  const toggleStatus = (status: string) => {
    setHiddenStatuses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(status)) {
        newSet.delete(status)
      } else {
        newSet.add(status)
      }
      return newSet
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Flights by Status - Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Flights by Status</h2>
        {statusData.length > 0 ? (
          <div className="flex gap-6 items-center">
            {/* Pie Chart on the left */}
            <div className="w-1/3 shrink-0" style={{ height: '300px', paddingTop: '20px', paddingBottom: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visibleStatusData as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => (percent && percent > 0.05) ? `${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius="75%"
                    fill="#8884d8"
                    dataKey="value"
                    onClick={handlePieClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {visibleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [
                      `${value || 0} flight${(value || 0) !== 1 ? 's' : ''}`,
                      props?.payload?.name || ''
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Status list on the right */}
            <div className="w-2/3 flex gap-x-4">
              {statusColumns.map((column, colIndex) => (
                <div key={colIndex} className="flex-1 space-y-0.5">
                  {column.map((entry, index) => {
                    const isHidden = hiddenStatuses.has(entry.status)
                    return (
                      <button
                        key={entry.status}
                        onClick={() => toggleStatus(entry.status)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div 
                          className={`w-4 h-4 rounded-full shrink-0 ${isHidden ? 'opacity-30' : ''}`}
                          style={{ backgroundColor: getStatusColor(entry.status) }}
                        />
                        <span className={`text-sm flex-1 ${isHidden ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {getStatusLabel(entry.status)}
                        </span>
                        <span className={`text-sm font-medium ${isHidden ? 'text-gray-400' : 'text-gray-900'}`}>
                          {entry.value}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Flights Over Time - Line Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Flights Created</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
            <option value="all">All time</option>
          </select>
        </div>
        {filteredFlightsOverTime.some(d => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredFlightsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={COLORS.active} 
                strokeWidth={2}
                name="Flights Created"
                dot={{ fill: COLORS.active, r: 4, cursor: 'pointer' }}
                activeDot={{ r: 6, cursor: 'pointer', onClick: (e: any, payload: any) => {
                  if (payload && payload.payload) {
                    handleLineClick(payload.payload)
                  }
                }}}
                onClick={(data: any) => {
                  // Handle click on line or dots
                  if (data && data.activePayload && data.activePayload[0] && data.activePayload[0].payload) {
                    handleLineClick(data.activePayload[0].payload)
                  }
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Completed Flights by Month - Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Completed Flights</h2>
          <select
            value={completedTimeRange}
            onChange={(e) => setCompletedTimeRange(e.target.value as TimeRange)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
            <option value="all">All time</option>
          </select>
        </div>
        {filteredCompletedOverTime.some(d => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredCompletedOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="count" 
                fill={COLORS.completed}
                radius={[8, 8, 0, 0]}
                name="Completed Flights"
                onClick={(data: any) => {
                  if (data && data.payload) {
                    handleBarClick(data.payload)
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No completed flights yet
          </div>
        )}
      </div>
    </div>
  )
}
