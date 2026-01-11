'use client'

import { Clock, User, ArrowRight } from 'lucide-react'
import type { AuditLog } from '@/lib/types/database'
import { getStatusDisplayName } from '@/lib/utils/status-transitions'

interface StatusTimelineProps {
  logs: AuditLog[]
}

export function StatusTimeline({ logs }: StatusTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No status history available</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusChange = (log: AuditLog) => {
    if (log.changes && typeof log.changes === 'object') {
      // Check if it's a status change with from/to directly
      if ('from' in log.changes && 'to' in log.changes) {
        return {
          from: log.changes.from as string,
          to: log.changes.to as string,
        }
      }
      // Check if it's nested under status
      if ('status' in log.changes && typeof log.changes.status === 'object') {
        const statusChange = log.changes.status as { from?: string; to?: string }
        return {
          from: statusChange.from,
          to: statusChange.to,
        }
      }
    }
    return null
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const statusChange = getStatusChange(log)
        
        return (
          <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
            <div className="shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            </div>
            <div className="flex-1 min-w-0">
              {statusChange ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">
                    {getStatusDisplayName(statusChange.from || 'unknown')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-primary">
                    {getStatusDisplayName(statusChange.to || 'unknown')}
                  </span>
                </div>
              ) : (
                <p className="font-medium text-gray-900">{log.action}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(log.created_at)}</span>
                {log.user_id && (
                  <>
                    <span>•</span>
                    <User className="w-3 h-3" />
                    <span>User {log.user_id.slice(0, 8)}...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
