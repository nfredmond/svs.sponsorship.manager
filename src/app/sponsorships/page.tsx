import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateShort, getCurrentFiscalYear } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getSponsorships() {
  const supabase = await createClient()
  const currentFY = getCurrentFiscalYear()
  
  const { data: sponsorships, error } = await supabase
    .from('sponsorships')
    .select('*, sponsor:sponsors(*), tier:sponsorship_tiers(*)')
    .eq('fiscal_year', currentFY)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sponsorships:', error)
    return []
  }

  return sponsorships
}

export default async function SponsorshipsPage() {
  const sponsorships = await getSponsorships()
  const currentFY = getCurrentFiscalYear()

  const received = sponsorships.filter(s => s.status === 'Received').length
  const pending = sponsorships.filter(s => s.status === 'Pending').length
  const overdue = sponsorships.filter(s => s.status === 'Overdue').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received':
        return 'default'
      case 'Pending':
        return 'secondary'
      case 'Overdue':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sponsorships</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fiscal Year {currentFY}
            </p>
          </div>
          <Link href="/sponsorships/new">
            <Button className="bg-svs-gold hover:bg-svs-gold/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Sponsorship
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sponsorships.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{received}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sponsorships Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sponsorships</CardTitle>
          </CardHeader>
          <CardContent>
            {sponsorships.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsorships.map((sponsorship) => (
                    <TableRow key={sponsorship.id}>
                      <TableCell className="font-medium text-gray-900">
                        {sponsorship.sponsor?.organization_name}
                      </TableCell>
                      <TableCell className="text-gray-700">{sponsorship.tier?.tier_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sponsorship.sponsorship_type}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {formatCurrency(sponsorship.total_value)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {sponsorship.payment_date
                          ? formatDateShort(sponsorship.payment_date)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(sponsorship.status)}>
                          {sponsorship.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No sponsorships found</p>
                <Link href="/sponsorships/new">
                  <Button className="mt-4 bg-svs-gold hover:bg-svs-gold/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Sponsorship
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

