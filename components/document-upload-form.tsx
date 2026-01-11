'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { uploadDocumentAction } from '@/lib/actions/documents'
import { useToast } from '@/components/toast'
import type { DocumentType } from '@/lib/types/database'

interface DocumentUploadFormProps {
  flightId: string
  onUploadSuccess?: (document: any) => void
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'registration', label: 'Registration', description: 'Aircraft registration certificate' },
  { value: 'airworthiness', label: 'Airworthiness Certificate', description: 'FAA airworthiness certificate' },
  { value: 'logbook', label: 'Logbook Entry', description: 'Aircraft or engine logbook entry' },
  { value: 'permit', label: 'FAA Permit', description: 'Special flight permit or authorization' },
  { value: 'insurance', label: 'Insurance', description: 'Insurance policy or certificate' },
  { value: 'mechanic_statement', label: 'Mechanic Statement', description: 'Mechanic statement or sign-off' },
  { value: 'weight_balance', label: 'Weight & Balance', description: 'Weight and balance calculation' },
  { value: 'other', label: 'Other', description: 'Other document' },
]

export function DocumentUploadForm({ flightId, onUploadSuccess }: DocumentUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>('other')
  const [description, setDescription] = useState('')
  const [showForm, setShowForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error: showError } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      showError('File size exceeds 50MB limit')
      return
    }

    setSelectedFile(file)
    setShowForm(true)

    // Auto-detect document type from filename
    const fileName = file.name.toLowerCase()
    if (fileName.includes('registration')) {
      setDocumentType('registration')
    } else if (fileName.includes('airworthiness')) {
      setDocumentType('airworthiness')
    } else if (fileName.includes('logbook')) {
      setDocumentType('logbook')
    } else if (fileName.includes('permit')) {
      setDocumentType('permit')
    } else if (fileName.includes('insurance')) {
      setDocumentType('insurance')
    } else if (fileName.includes('weight') || fileName.includes('balance')) {
      setDocumentType('weight_balance')
    } else if (fileName.includes('mechanic') || fileName.includes('signoff')) {
      setDocumentType('mechanic_statement')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', documentType)
      formData.append('category', documentType) // Use type as category for now
      if (description) {
        formData.append('description', description)
      }

      const newDoc = await uploadDocumentAction(flightId, formData)

      if (newDoc) {
        success('Document uploaded successfully')
        setSelectedFile(null)
        setDescription('')
        setDocumentType('other')
        setShowForm(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onUploadSuccess?.(newDoc)
      } else {
        showError('Failed to upload document')
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An error occurred while uploading')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setDescription('')
    setDocumentType('other')
    setShowForm(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.txt,.csv"
          className="hidden"
          id="document-upload"
        />
        <label
          htmlFor="document-upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </label>
      </div>

      {showForm && selectedFile && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Document Type <span className="text-destructive">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              disabled={isUploading}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={2}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="Add a description for this document..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
