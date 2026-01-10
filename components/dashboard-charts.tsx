'use client'

import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'

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
}

interface DashboardChartsProps {
  statusData: StatusData[]
  flightsOverTime: TimeSeriesData[]
  completedOverTime: TimeSeriesData[]
  allFlights: FlightDateData[]
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

const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('active') || statusLower.includes('scheduled') || statusLower.includes('in_progress') || statusLower.includes('permit_issued')) {
    return statusLower.includes('permit_issued') ? COLORS.permitIssued : COLORS.active
  }
  if (statusLower.includes('pending') || statusLower.includes('draft') || statusLower.includes('inspection') || statusLower.includes('faa')) {
    return COLORS.pending
  }
  if (statusLower.includes('completed')) {
    return COLORS.completed
  }
  return COLORS.default
}

export function DashboardCharts({ statusData, flightsOverTime, completedOverTime, allFlights }: DashboardChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('6')
  const [completedTimeRange, setCompletedTimeRange] = useState<TimeRange>('6')

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
      return { month, count }
    })
  }, [months, allFlights])

  // Filter and process completed flights over time based on selected range
  const filteredCompletedOverTime = useMemo(() => {
    return completedMonths.map(({ month, monthKey }) => {
      const count = allFlights.filter(flight => {
        if (!flight.actual_arrival && !flight.updated_at) return false
        const flightDate = new Date(flight.actual_arrival || flight.updated_at)
        const flightMonthKey = `${flightDate.getFullYear()}-${String(flightDate.getMonth() + 1).padStart(2, '0')}`
        return flightMonthKey === monthKey
      }).length
      return { month, count }
    })
  }, [completedMonths, allFlights])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Flights by Status - Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Flights by Status</h2>
        {statusData.length > 0 ? (
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value} flight${value !== 1 ? 's' : ''}`,
                    props.payload.name
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getStatusColor(entry.status) }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
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
                dot={{ fill: COLORS.active, r: 4 }}
                activeDot={{ r: 6 }}
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
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
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
