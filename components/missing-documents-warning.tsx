'use client'

import { AlertCircle, FileText, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Document } from '@/lib/types/database'
import type { FerryFlightStatus } from '@/lib/types/database'

interface MissingDocumentsWarningProps {
  flightId: string
  flightStatus: FerryFlightStatus
  documents: Document[]
}

// Define required documents by status
const REQUIRED_DOCUMENTS: Record<FerryFlightStatus, string[]> = {
  draft: [],
  inspection_pending: ['registration', 'airworthiness_certificate'],
  inspection_complete: ['registration', 'airworthiness_certificate', 'logbook_entry', 'mechanic_statement'],
  faa_submitted: ['registration', 'airworthiness_certificate', 'logbook_entry', 'mechanic_statement', 'insurance'],
  faa_questions: ['registration', 'airworthiness_certificate', 'logbook_entry', 'mechanic_statement', 'insurance'],
  permit_issued: ['registration', 'airworthiness_certificate', 'logbook_entry', 'mechanic_statement', 'insurance', 'faa_permit'],
  scheduled: ['registration', 'airworthiness_certificate', 'logbook_entry', 'mechanic_statement', 'insurance', 'faa_permit'],
  in_progress: ['registration', 'airworthiness_certificate', 'logbook_entry', 'mechanic_statement', 'insurance', 'faa_permit'],
  completed: [],
  aborted: [],
  denied: [],
}

const DOCUMENT_TYPE_MAP: Record<string, string[]> = {
  registration: ['registration', 'reg'],
  airworthiness_certificate: ['airworthiness', 'aw', 'airworthiness_certificate'],
  logbook_entry: ['logbook', 'log'],
  mechanic_statement: ['mechanic', 'mechanic_statement', 'signoff'],
  insurance: ['insurance'],
  faa_permit: ['faa', 'permit', 'faa_permit'],
  weight_balance: ['weight', 'balance', 'w&b', 'w_b'],
}

function normalizeDocumentType(type: string): string {
  const lower = type.toLowerCase()
  for (const [key, variants] of Object.entries(DOCUMENT_TYPE_MAP)) {
    if (variants.some(v => lower.includes(v))) {
      return key
    }
  }
  return lower
}

function hasDocumentType(documents: Document[], requiredType: string): boolean {
  return documents.some(doc => {
    const normalized = normalizeDocumentType(doc.document_type || '')
    return normalized === requiredType || normalized.includes(requiredType) || requiredType.includes(normalized)
  })
}

export function MissingDocumentsWarning({
  flightId,
  flightStatus,
  documents,
}: MissingDocumentsWarningProps) {
  const required = REQUIRED_DOCUMENTS[flightStatus] || []
  
  if (required.length === 0) {
    return null
  }

  const missing = required.filter(req => !hasDocumentType(documents, req))
  
  if (missing.length === 0) {
    return (
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium">All required documents are present</p>
        </div>
      </Card>
    )
  }

  const documentLabels: Record<string, string> = {
    registration: 'Aircraft Registration',
    airworthiness_certificate: 'Airworthiness Certificate',
    logbook_entry: 'Logbook Entry',
    mechanic_statement: 'Mechanic Statement',
    insurance: 'Insurance Policy',
    faa_permit: 'FAA Permit',
    weight_balance: 'Weight & Balance',
  }

  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Missing Required Documents
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            The following documents are required for the current status:
          </p>
          <ul className="space-y-1">
            {missing.map((doc) => (
              <li key={doc} className="flex items-center gap-2 text-sm text-yellow-800">
                <FileText className="w-4 h-4" />
                {documentLabels[doc] || doc}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
