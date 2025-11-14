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
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg"
                  >
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
                ))
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
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
              <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
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
              <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
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
              {Object.entries(dashboardData.tierCounts || {}).map(([tier, count]) => (
                <div key={tier} className="text-center p-4 border dark:border-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-svs-gold">{count as number}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{tier}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

