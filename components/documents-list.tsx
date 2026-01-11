'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Trash2, Download } from 'lucide-react'
import type { Document } from '@/lib/types/database'
import { deleteDocumentAction, getDocumentDownloadUrlAction } from '@/lib/actions/documents'
import { DocumentUploadForm } from '@/components/document-upload-form'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast'

interface DocumentsListProps {
  flightId: string
  initialDocuments: Document[]
}

export function DocumentsList({ flightId, initialDocuments }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const router = useRouter()
  const { success, error: showError } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    const successResult = await deleteDocumentAction(id)
    if (successResult) {
      setDocuments(documents.filter(d => d.id !== id))
      success('Document deleted successfully')
      router.refresh()
    } else {
      showError('Failed to delete document')
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const url = await getDocumentDownloadUrlAction(documentId)
      if (url) {
        // Open in new tab or trigger download
        window.open(url, '_blank')
      } else {
        showError('Failed to generate download URL')
      }
    } catch (err) {
      showError('Failed to download document')
    }
  }

  const handleUploadSuccess = (newDoc: Document) => {
    setDocuments([...documents, newDoc])
    router.refresh()
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      registration: 'bg-blue-100 text-blue-700',
      airworthiness: 'bg-green-100 text-green-700',
      logbooks: 'bg-purple-100 text-purple-700',
      permit: 'bg-yellow-100 text-yellow-700',
      insurance: 'bg-indigo-100 text-indigo-700',
      'weight-balance': 'bg-pink-100 text-pink-700',
      additional: 'bg-gray-100 text-gray-700',
    }
    return colors[category || 'additional'] || 'bg-gray-100 text-gray-700'
  }

  const groupedDocuments = documents.reduce((acc, doc) => {
    const category = doc.category || 'uncategorized'
    if (!acc[category]) acc[category] = []
    acc[category].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
        </div>
        <DocumentUploadForm flightId={flightId} onUploadSuccess={handleUploadSuccess} />
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-700 mb-3 capitalize">
                {category.replace('-', ' ')}
              </h3>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-500">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getCategoryColor(doc.category)}>
                            {doc.type || 'Document'}
                          </Badge>
                          {doc.file_size && (
                            <span className="text-xs text-gray-500">
                              {(doc.file_size / 1024).toFixed(1)} KB
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(doc.id, doc.file_name)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
