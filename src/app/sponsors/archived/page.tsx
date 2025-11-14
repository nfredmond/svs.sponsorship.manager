import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ArchivedSponsorsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Archived Sponsors</h1>
          <p className="text-gray-500 mt-1">View inactive sponsor organizations</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No archived sponsors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">All sponsors are currently active.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

