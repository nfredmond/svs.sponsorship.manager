'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { FiscalYearSelector } from '@/components/fiscal-year-selector'
import {
  DollarSign,
  TrendingUp,
  Users,
  Heart,
  Target,
  Plus,
  FileText,
  AlertCircle,
  Clock,
  Activity,
  Mail,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/dashboard/stat-card'

interface DashboardClientProps {
  dashboardData: any
  currentFY: string
}

export function DashboardClient({ dashboardData, currentFY }: DashboardClientProps) {
  const searchParams = useSearchParams()
  const selectedFY = searchParams.get('fy') || currentFY

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fiscal Year Overview
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <FiscalYearSelector currentFY={currentFY} />
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
          <CardTitle>Fiscal Year {selectedFY} Goal Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-svs-gold">
                {formatCurrency(dashboardData.grandTotal)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                of {formatCurrency(dashboardData.fiscalYearGoal)} goal
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardData.progressPercent.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(dashboardData.fiscalYearGoal - dashboardData.grandTotal)} remaining
              </p>
            </div>
          </div>
          <Progress value={dashboardData.progressPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Monetary"
          value={formatCurrency(dashboardData.totalMonetary)}
          icon={DollarSign}
          description={selectedFY}
        />
        <StatCard
          title="Total In-Kind"
          value={formatCurrency(dashboardData.totalInKind)}
          icon={TrendingUp}
          description="Services & goods donated"
        />
        <StatCard
          title="Active Sponsors"
          value={dashboardData.uniqueSponsors}
          icon={Users}
          description="Unique organizations"
        />
        <StatCard
          title="Scot Mende Fund"
          value={formatCurrency(dashboardData.scotMendeFund)}
          icon={Heart}
          description="Mentorship program support"
        />
      </div>

      {/* Sponsor Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {dashboardData.activeSponsorCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Current active relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {dashboardData.expiringSponsorships.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Within next 90 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Lapsed Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {dashboardData.lapsedSponsorCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Need follow-up
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Sponsors Alert */}
      {dashboardData.expiringSponsorships.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <CardTitle className="text-yellow-900 dark:text-yellow-200">
                  Sponsorships Expiring Soon
                </CardTitle>
              </div>
              <Link href="/sponsors">
                <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-300">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.expiringSponsorships.slice(0, 5).map((sponsorship: any) => {
                const daysUntilExpiration = Math.ceil(
                  (new Date(sponsorship.expiration_date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                return (
                  <div
                    key={sponsorship.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {sponsorship.sponsor?.organization_name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {sponsorship.tier?.tier_name} • {formatCurrency(sponsorship.total_value)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                        {daysUntilExpiration} days
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDateShort(sponsorship.expiration_date)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTransactions.length > 0 ? (
                dashboardData.recentTransactions.map((transaction: any) => (
                  <Link key={transaction.id} href={`/sponsors/${transaction.sponsor_id}`}>
                    <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {transaction.sponsor?.organization_name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {transaction.tier?.tier_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(transaction.total_value)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDateShort(transaction.payment_date)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  No transactions yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentInteractions.length > 0 ? (
                dashboardData.recentInteractions.map((interaction: any) => (
                  <div
                    key={interaction.id}
                    className="flex items-start gap-3 p-3 border dark:border-gray-700 rounded-lg"
                  >
                    <div className="h-8 w-8 rounded-full bg-svs-gold/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-svs-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {interaction.summary}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {interaction.sponsor?.organization_name}
                        {interaction.contact && ` • ${interaction.contact.contact_name}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDateShort(interaction.interaction_date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  No recent activity
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
              <Link href="/sponsorships/pending">
                <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Pending Payments</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting receipt</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{dashboardData.pending}</Badge>
                </div>
              </Link>
              <Link href="/sponsorships/overdue">
                <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Target className="h-5 w-5 text-red-600 dark:text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Overdue Items</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Requires attention</p>
                    </div>
                  </div>
                  <Badge variant="destructive">{dashboardData.overdue}</Badge>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sponsors by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Sponsors by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dashboardData.tierCounts || {}).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{tier}</p>
                  <Badge variant="outline" className="text-svs-gold border-svs-gold">
                    {count as number}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

