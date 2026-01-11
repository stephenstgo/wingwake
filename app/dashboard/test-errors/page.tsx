'use client'

import { useState } from 'react'
import { useToast } from '@/components/toast'

export default function TestErrorsPage() {
  const { success, error, info, warning } = useToast()
  const [shouldError, setShouldError] = useState(false)

  // Force an error to test error boundary
  if (shouldError) {
    throw new Error('This is a test error to demonstrate error handling!')
  }

  const handleToastSuccess = () => {
    success('Operation completed successfully! 🎉')
  }

  const handleToastError = () => {
    error('Something went wrong. Please try again.')
  }

  const handleToastInfo = () => {
    info('Here is some helpful information.')
  }

  const handleToastWarning = () => {
    warning('Warning: This action may have consequences.')
  }

  const handleTriggerError = () => {
    setShouldError(true)
  }

  const handleAsyncError = async () => {
    try {
      // Simulate an async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Async operation failed')), 1000)
      })
    } catch (err: any) {
      error(err.message || 'An error occurred')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Error Handling & Toast Testing</h1>
      
      <div className="space-y-6">
        {/* Toast Notifications Section */}
        <section className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Toast Notifications</h2>
          <p className="text-muted-foreground mb-4">
            Click the buttons below to test different toast notification types.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleToastSuccess}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Show Success Toast
            </button>
            
            <button
              onClick={handleToastError}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Show Error Toast
            </button>
            
            <button
              onClick={handleToastInfo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Show Info Toast
            </button>
            
            <button
              onClick={handleToastWarning}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Show Warning Toast
            </button>
          </div>
        </section>

        {/* Error Handling Section */}
        <section className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Error Handling</h2>
          <p className="text-muted-foreground mb-4">
            Test the global error boundary by triggering errors.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleTriggerError}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Trigger React Error (Error Boundary)
            </button>
            
            <button
              onClick={handleAsyncError}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Trigger Async Error (Toast)
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> The "Trigger React Error" button will cause the error boundary to catch the error and display the error page. 
              The "Trigger Async Error" button will catch the error and show it as a toast notification.
            </p>
          </div>
        </section>

        {/* Usage Examples Section */}
        <section className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Usage Examples</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Using Toast in Components</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`import { useToast } from '@/components/toast'

function MyComponent() {
  const { success, error, info, warning } = useToast()
  
  const handleSave = async () => {
    try {
      await saveData()
      success('Data saved successfully!')
    } catch (err) {
      error('Failed to save data')
    }
  }
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Error Boundary</h3>
              <p className="text-sm text-muted-foreground">
                The error boundary is automatically active throughout the app. 
                Any unhandled React errors will be caught and displayed with a user-friendly error page.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
