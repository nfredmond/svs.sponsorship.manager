import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { getCurrentFiscalYear } from '@/lib/fiscal-year'
import { BarChart3, Download, TrendingUp, DollarSign, Users, Target } from 'lucide-react'
import { FiscalYearSelector } from '@/components/fiscal-year-selector'

async function getTierAnalysis(fiscalYear: string) {
  const supabase = await createClient()

  // Get all sponsorship tiers
  const { data: tiers } = await supabase
    .from('sponsorship_tiers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Get sponsorships for the fiscal year
  const { data: sponsorships } = await supabase
    .from('sponsorships')
    .select(`
      *,
      tier:sponsorship_tiers(*),
      sponsor:sponsors(*)
    `)
    .eq('fiscal_year', fiscalYear)

  // Calculate metrics per tier
  const tierMetrics = tiers?.map(tier => {
    const tierSponsorships = sponsorships?.filter(s => s.sponsorship_tier_id === tier.id) || []

    const totalCount = tierSponsorships.length
    const receivedCount = tierSponsorships.filter(s => s.status === 'Received').length
    const pendingCount = tierSponsorships.filter(s => s.status === 'Pending').length

    const totalRevenue = tierSponsorships
      .filter(s => s.status === 'Received')
      .reduce((sum, s) => sum + Number(s.total_value), 0)

    const monetaryRevenue = tierSponsorships
      .filter(s => s.status === 'Received')
      .reduce((sum, s) => sum + Number(s.monetary_amount), 0)

    const inKindValue = tierSponsorships
      .filter(s => s.status === 'Received')
      .reduce((sum, s) => sum + Number(s.in_kind_value), 0)

    const averageValue = receivedCount > 0 ? totalRevenue / receivedCount : 0
    const fulfillmentRate = totalCount > 0 ? (receivedCount / totalCount) * 100 : 0

    return {
      tier,
      totalCount,
      receivedCount,
      pendingCount,
      totalRevenue,
      monetaryRevenue,
      inKindValue,
      averageValue,
      fulfillmentRate,
      sponsorships: tierSponsorships,
    }
  }) || []

  // Calculate overall totals
  const grandTotals = {
    totalSponsors: sponsorships?.length || 0,
    receivedSponsors: sponsorships?.filter(s => s.status === 'Received').length || 0,
    totalRevenue: sponsorships
      ?.filter(s => s.status === 'Received')
      .reduce((sum, s) => sum + Number(s.total_value), 0) || 0,
    monetaryRevenue: sponsorships
      ?.filter(s => s.status === 'Received')
      .reduce((sum, s) => sum + Number(s.monetary_amount), 0) || 0,
    inKindValue: sponsorships
      ?.filter(s => s.status === 'Received')
      .reduce((sum, s) => sum + Number(s.in_kind_value), 0) || 0,
  }

  return { tierMetrics, grandTotals, fiscalYear }
}

export default async function ByTierReportPage({
  searchParams,
}: {
  searchParams: Promise<{ fy?: string }>
}) {
  const params = await searchParams
  const currentFY = getCurrentFiscalYear()
  const selectedFY = params.fy || currentFY
  const data = await getTierAnalysis(selectedFY)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              By-Tier Analysis
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Sponsorship performance breakdown by tier level
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <FiscalYearSelector currentFY={currentFY} />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Sponsorships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.grandTotals.totalSponsors}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.grandTotals.receivedSponsors} received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-svs-gold">
                {formatCurrency(data.grandTotals.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All sponsorships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Monetary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(data.grandTotals.monetaryRevenue)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cash contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                In-Kind Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(data.grandTotals.inKindValue)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Services & goods</p>
            </CardContent>
          </Card>
        </div>

        {/* Tier Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Performance by Tier
          </h2>

          {data.tierMetrics.length > 0 ? (
            data.tierMetrics.map((metric, index) => {
              const revenuePercentage =
                data.grandTotals.totalRevenue > 0
                  ? (metric.totalRevenue / data.grandTotals.totalRevenue) * 100
                  : 0

              return (
                <Card key={metric.tier.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-svs-gold/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-svs-gold">{index + 1}</span>
                          </div>
                          <div>
                            <CardTitle className="text-xl">{metric.tier.tier_name}</CardTitle>
                            <CardDescription className="mt-1">
                              {metric.tier.suggested_amount &&
                                `Suggested: ${formatCurrency(metric.tier.suggested_amount)}`}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-svs-gold">
                          {formatCurrency(metric.totalRevenue)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {revenuePercentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Metrics Grid */}
                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Sponsors
                          </p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {metric.receivedCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          of {metric.totalCount} total
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Avg Value
                          </p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(metric.averageValue)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per sponsor</p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Fulfillment
                          </p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {metric.fulfillmentRate.toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          completion rate
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Pending
                          </p>
                        </div>
                        <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                          {metric.pendingCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          awaiting payment
                        </p>
                      </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div className="border dark:border-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Monetary Contributions
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(metric.monetaryRevenue)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {metric.monetaryRevenue > 0
                            ? `${((metric.monetaryRevenue / metric.totalRevenue) * 100).toFixed(
                                0
                              )}% of tier revenue`
                            : 'No monetary contributions'}
                        </p>
                      </div>

                      <div className="border dark:border-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          In-Kind Value
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(metric.inKindValue)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {metric.inKindValue > 0
                            ? `${((metric.inKindValue / metric.totalRevenue) * 100).toFixed(
                                0
                              )}% of tier revenue`
                            : 'No in-kind contributions'}
                        </p>
                      </div>
                    </div>

                    {/* Benefits Info */}
                    {(metric.tier.awards_tickets_included > 0 ||
                      metric.tier.speaker_series_passes > 0) && (
                      <div className="border-t dark:border-gray-700 pt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Included Benefits
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {metric.tier.awards_tickets_included > 0 && (
                            <Badge variant="secondary">
                              {metric.tier.awards_tickets_included} Awards Ticket
                              {metric.tier.awards_tickets_included !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          {metric.tier.speaker_series_passes > 0 && (
                            <Badge variant="secondary">
                              {metric.tier.speaker_series_passes} Speaker Series Pass
                              {metric.tier.speaker_series_passes !== 1 ? 'es' : ''}
                            </Badge>
                          )}
                          {metric.tier.program_specific && (
                            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">
                              {metric.tier.program_specific}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No sponsorships for {selectedFY}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  There are no sponsorships recorded for this fiscal year yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

