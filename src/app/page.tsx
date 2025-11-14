import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateShort, getCurrentFiscalYear } from '@/lib/utils'
import {
  DollarSign,
  TrendingUp,
  Users,
  Heart,
  Target,
  Plus,
  FileText,
} from 'lucide-react'
import Link from 'next/link'

async function getDashboardData() {
  const supabase = await createClient()
  const currentFY = getCurrentFiscalYear()

  // Get sponsorships for current fiscal year
  const { data: sponsorships } = await supabase
    .from('sponsorships')
    .select('*, sponsor:sponsors(*), tier:sponsorship_tiers(*)')
    .eq('fiscal_year', currentFY)

  // Get individual donations for current fiscal year
  const { data: donations } = await supabase
    .from('individual_donations')
    .select('*')
    .gte('donation_date', `${currentFY.split('/')[0]}-07-01`)
    .lte('donation_date', `${currentFY.split('/')[1]}-06-30`)

  // Calculate metrics
  const totalMonetary = sponsorships?.reduce((sum, s) => sum + Number(s.monetary_amount), 0) || 0
  const totalInKind = sponsorships?.reduce((sum, s) => sum + Number(s.in_kind_value), 0) || 0
  const totalDonations = donations?.reduce((sum, d) => sum + Number(d.donation_amount), 0) || 0
  const scotMendeFund = sponsorships?.reduce((sum, s) => sum + Number(s.scot_mende_amount), 0) || 0
  const grandTotal = totalMonetary + totalInKind + totalDonations

  const fiscalYearGoal = 11500
  const progressPercent = (grandTotal / fiscalYearGoal) * 100

  // Get active sponsors count
  const uniqueSponsors = new Set(sponsorships?.map(s => s.sponsor_id)).size

  // Get recent transactions (last 10)
  const recentTransactions = sponsorships
    ?.filter(s => s.status === 'Received' && s.payment_date)
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    .slice(0, 10) || []

  // Get pending and overdue
  const pending = sponsorships?.filter(s => s.status === 'Pending').length || 0
  const overdue = sponsorships?.filter(s => s.status === 'Overdue').length || 0

  // Get sponsors by tier
  const tierCounts = sponsorships?.reduce((acc, s) => {
    const tierName = s.tier?.tier_name || 'Unknown'
    acc[tierName] = (acc[tierName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalMonetary,
    totalInKind,
    totalDonations,
    scotMendeFund,
    grandTotal,
    fiscalYearGoal,
    progressPercent,
    uniqueSponsors,
    recentTransactions,
    pending,
    overdue,
    tierCounts,
    currentFY,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Fiscal Year {data.currentFY} Overview
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/sponsorships/new">
              <Button className="bg-svs-gold hover:bg-svs-gold/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Sponsorship
              </Button>
            </Link>
            <Link href="/reports/fiscal-year">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Fiscal Year Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Fiscal Year Goal Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-svs-gold">
                  {formatCurrency(data.grandTotal)}
                </p>
                <p className="text-sm text-gray-500">
                  of {formatCurrency(data.fiscalYearGoal)} goal
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {data.progressPercent.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(data.fiscalYearGoal - data.grandTotal)} remaining
                </p>
              </div>
            </div>
            <Progress value={data.progressPercent} className="h-3" />
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Monetary"
            value={formatCurrency(data.totalMonetary)}
            icon={DollarSign}
            description={`${data.currentFY}`}
          />
          <StatCard
            title="Total In-Kind"
            value={formatCurrency(data.totalInKind)}
            icon={TrendingUp}
            description="Services & goods donated"
          />
          <StatCard
            title="Active Sponsors"
            value={data.uniqueSponsors}
            icon={Users}
            description="Unique organizations"
          />
          <StatCard
            title="Scot Mende Fund"
            value={formatCurrency(data.scotMendeFund)}
            icon={Heart}
            description="Mentorship program support"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentTransactions.length > 0 ? (
                  data.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.sponsor?.organization_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.tier?.tier_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(transaction.total_value)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateShort(transaction.payment_date)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No transactions yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Items */}
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Target className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pending Payments</p>
                      <p className="text-sm text-gray-500">Awaiting receipt</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{data.pending}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Target className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Overdue Items</p>
                      <p className="text-sm text-gray-500">Requires attention</p>
                    </div>
                  </div>
                  <Badge variant="destructive">{data.overdue}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sponsors by Tier */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Sponsors by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(data.tierCounts || {}).map(([tier, count]) => (
                  <div key={tier} className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-svs-gold">{count as number}</p>
                    <p className="text-sm text-gray-600 mt-1">{tier}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

