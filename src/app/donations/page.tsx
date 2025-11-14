import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { Plus, Heart } from 'lucide-react'
import Link from 'next/link'

async function getDonations() {
  const supabase = await createClient()
  
  const { data: donations } = await supabase
    .from('individual_donations')
    .select('*')
    .order('donation_date', { ascending: false })

  return donations || []
}

export default async function DonationsPage() {
  const donations = await getDonations()
  const totalAmount = donations.reduce((sum, d) => sum + Number(d.donation_amount), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Individual Donations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track individual donations and contributions
            </p>
          </div>
          <Link href="/donations/new">
            <Button className="bg-svs-gold hover:bg-svs-gold/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Donation
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              <p className="text-xs text-muted-foreground">{donations.length} total donations</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length > 0 ? (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateShort(donation.donation_date)}
                      </p>
                      {donation.purpose && (
                        <p className="text-xs text-gray-400 mt-1">{donation.purpose}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(donation.donation_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No donations yet</p>
                <Link href="/donations/new">
                  <Button className="mt-4 bg-svs-gold hover:bg-svs-gold/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Donation
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

