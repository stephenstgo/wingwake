'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

interface FlightsFilterIndicatorProps {
  status?: string
  createdMonth?: string
  completedMonth?: string
  section?: string
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  inspection_pending: 'Inspection Pending',
  inspection_complete: 'Inspection Complete',
  faa_submitted: 'FAA Submitted',
  faa_questions: 'FAA Questions',
  permit_issued: 'Permit Issued',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  aborted: 'Aborted',
  denied: 'Denied',
}

const formatMonth = (monthKey: string): string => {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function FlightsFilterIndicator({
  status,
  createdMonth,
  completedMonth,
  section,
}: FlightsFilterIndicatorProps) {
  const hasFilter = status || createdMonth || completedMonth

  if (!hasFilter) {
    return null
  }

  const filterTexts: string[] = []

  if (status) {
    const statusLabel = statusLabels[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    filterTexts.push(`Status: ${statusLabel}`)
  }

  if (createdMonth) {
    filterTexts.push(`Created in ${formatMonth(createdMonth)}`)
  }

  if (completedMonth) {
    filterTexts.push(`Completed in ${formatMonth(completedMonth)}`)
  }

  if (section && !status && !createdMonth && !completedMonth) {
    const sectionLabels: Record<string, string> = {
      active: 'Active Flights',
      pending: 'Pending Flights',
      completed: 'Completed Flights',
    }
    filterTexts.push(sectionLabels[section] || section)
  }

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-sky-900">
          Showing filtered results:
        </span>
        <span className="text-sm text-sky-700">
          {filterTexts.join(' • ')}
        </span>
      </div>
      <Link
        href="/dashboard/flights"
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sky-700 hover:text-sky-900 hover:bg-sky-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
        Show all flights
      </Link>
    </div>
  )
}
