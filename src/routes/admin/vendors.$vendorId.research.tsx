import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

import { AuthGuard } from '../../components/guards/AuthGuard'
import { Button } from '../../components/ui/button'
import { useVendorResearchHistory, useStartVendorResearch } from '../../queries/vendors'
import { VendorResearchStatus } from '../../types/api'

const statusStyles: Record<VendorResearchStatus, string> = {
  [VendorResearchStatus.pending]: 'bg-yellow-100 text-yellow-800',
  [VendorResearchStatus.in_progress]: 'bg-blue-100 text-blue-800',
  [VendorResearchStatus.completed]: 'bg-green-100 text-green-800',
  [VendorResearchStatus.failed]: 'bg-red-100 text-red-800',
}

const VendorResearchListPage = () => {
  const { vendorId } = Route.useParams()
  const { data, isLoading, error, refetch, isFetching } = useVendorResearchHistory(vendorId)
  const startResearchMutation = useStartVendorResearch()

  const handleRunResearch = () => {
    startResearchMutation.mutate(vendorId, {
      onSuccess: (response) => {
        if (response.success) {
          refetch()
        } else if (response.error) {
          alert(`Unable to queue research: ${response.error}`)
        }
      },
      onError: () => alert('Unable to queue research right now. Please try again.'),
    })
  }

  const history = data?.success ? data.data : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor AI Research</h1>
            <p className="text-sm text-gray-600">
              Review automated research runs for vendor #{vendorId}. Trigger new research to refresh data.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/vendors/$vendorId/edit" params={{ vendorId }}>
                Back to vendor
              </Link>
            </Button>
            <Button onClick={() => refetch()} variant="outline" disabled={isFetching}>
              {isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Refresh
            </Button>
            <Button onClick={handleRunResearch} disabled={startResearchMutation.isPending}>
              {startResearchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Run AI Research
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading research history…</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Failed to load research history. Please try again.
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            No research runs recorded yet. Trigger AI research to populate this list.
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm">
            <ul className="divide-y divide-gray-200">
              {history.map((record) => (
                <li key={record.id} className="p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[record.status]}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-600">
                          Requested {new Date(record.requestedAt).toLocaleString()}
                        </span>
                        {record.completedAt && (
                          <span className="text-xs text-gray-500">Completed {new Date(record.completedAt).toLocaleString()}</span>
                        )}
                        {record.llmModel && (
                          <span className="text-xs text-gray-500">Model: {record.llmModel}</span>
                        )}
                      </div>
                      {record.errorMessage && (
                        <p className="text-xs text-red-600">Error: {record.errorMessage}</p>
                      )}
                      {record.discoveredLogoUrl && (
                        <p className="text-xs text-gray-600">
                          Suggested logo: <a href={record.discoveredLogoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all">{record.discoveredLogoUrl}</a>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link
                          to="/admin/vendors/$vendorId/research/$researchId"
                          params={{ vendorId, researchId: String(record.id) }}
                        >
                          View details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/admin/vendors/$vendorId/research')({
  component: () => (
    <AuthGuard requiredRole="admin">
      <VendorResearchListPage />
    </AuthGuard>
  ),
})

