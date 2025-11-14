import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PaymentTimelineReportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Timeline</h1>
          <p className="text-gray-500 mt-1">Track payment timing and cashflow</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">This report is under development.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

