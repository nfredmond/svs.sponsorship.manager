import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getCurrentFiscalYear } from '@/lib/utils'

async function getReportData() {
  const supabase = await createClient()
  const currentFY = getCurrentFiscalYear()

  const { data: sponsorships } = await supabase
    .from('sponsorships')
    .select('*, sponsor:sponsors(*), tier:sponsorship_tiers(*)')
    .eq('fiscal_year', currentFY)

  const totalMonetary = sponsorships?.reduce((sum, s) => sum + Number(s.monetary_amount), 0) || 0
  const totalInKind = sponsorships?.reduce((sum, s) => sum + Number(s.in_kind_value), 0) || 0
  const scotMende = sponsorships?.reduce((sum, s) => sum + Number(s.scot_mende_amount), 0) || 0

  return {
    currentFY,
    totalMonetary,
    totalInKind,
    scotMende,
    grandTotal: totalMonetary + totalInKind,
    sponsorships: sponsorships || [],
  }
}

export default async function FiscalYearReportPage() {
  const data = await getReportData()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fiscal Year Summary Report</h1>
          <p className="text-gray-500 mt-1">
            Fiscal Year {data.currentFY}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.grandTotal)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monetary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.totalMonetary)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In-Kind</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.totalInKind)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scot Mende Fund</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.scotMende)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Sponsorships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sponsorships.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{s.sponsor?.organization_name}</p>
                    <p className="text-sm text-gray-500">{s.tier?.tier_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(s.total_value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

