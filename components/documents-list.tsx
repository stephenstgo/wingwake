'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Trash2, Download } from 'lucide-react'
import type { Document } from '@/lib/types/database'
import { uploadDocumentAction, deleteDocumentAction } from '@/lib/actions/documents'
import { useRouter } from 'next/navigation'

interface DocumentsListProps {
  flightId: string
  initialDocuments: Document[]
}

export function DocumentsList({ flightId, initialDocuments }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Determine document type from file name or category
    const fileName = file.name.toLowerCase()
    let type: string | undefined
    let category: string | undefined

    if (fileName.includes('registration')) {
      type = 'registration'
      category = 'registration'
    } else if (fileName.includes('airworthiness')) {
      type = 'airworthiness'
      category = 'airworthiness'
    } else if (fileName.includes('logbook')) {
      type = 'logbook'
      category = 'logbooks'
    } else if (fileName.includes('permit')) {
      type = 'permit'
      category = 'permit'
    } else if (fileName.includes('insurance')) {
      type = 'insurance'
      category = 'insurance'
    } else if (fileName.includes('weight') || fileName.includes('balance')) {
      type = 'weight_balance'
      category = 'weight-balance'
    } else {
      type = 'other'
      category = 'additional'
    }

    const formData = new FormData()
    formData.append('file', file)
    if (type) formData.append('type', type)
    if (category) formData.append('category', category)

    const newDoc = await uploadDocumentAction(flightId, formData)

    if (newDoc) {
      setDocuments([...documents, newDoc])
      router.refresh()
    }

    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    const success = await deleteDocumentAction(id)
    if (success) {
      setDocuments(documents.filter(d => d.id !== id))
      router.refresh()
    }
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
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
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

