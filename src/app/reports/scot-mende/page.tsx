import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ScotMendeReportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scot Mende Memorial Fund</h1>
          <p className="text-gray-500 mt-1">Mentorship program contributions</p>
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

