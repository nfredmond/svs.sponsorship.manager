import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { getCurrentFiscalYear } from '@/lib/fiscal-year'
import { DashboardClient } from './page-client'

async function getDashboardData(fiscalYear: string) {
  const supabase = await createClient()

  // Get fiscal year settings
  const { data: fySettings } = await supabase
    .from('fiscal_year_settings')
    .select('*')
    .eq('fiscal_year', fiscalYear)
    .single()

  const fiscalYearGoal = fySettings?.goal_amount || 11500

  // Get sponsorships for selected fiscal year
  const { data: sponsorships } = await supabase
    .from('sponsorships')
    .select('*, sponsor:sponsors(*), tier:sponsorship_tiers(*)')
    .eq('fiscal_year', fiscalYear)

  // Get individual donations for selected fiscal year
  const { data: donations } = await supabase
    .from('individual_donations')
    .select('*')
    .gte('donation_date', `${fiscalYear.split('/')[0]}-07-01`)
    .lte('donation_date', `${fiscalYear.split('/')[1]}-06-30`)

  // Calculate metrics
  const totalMonetary = sponsorships?.reduce((sum, s) => sum + Number(s.monetary_amount), 0) || 0
  const totalInKind = sponsorships?.reduce((sum, s) => sum + Number(s.in_kind_value), 0) || 0
  const totalDonations = donations?.reduce((sum, d) => sum + Number(d.donation_amount), 0) || 0
  const scotMendeFund = sponsorships?.reduce((sum, s) => sum + Number(s.scot_mende_amount), 0) || 0
  const grandTotal = totalMonetary + totalInKind + totalDonations

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
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ fy?: string }>
}) {
  const params = await searchParams
  const currentFY = getCurrentFiscalYear()
  const selectedFY = params.fy || currentFY
  const data = await getDashboardData(selectedFY)

  return (
    <DashboardLayout>
      <DashboardClient dashboardData={data} currentFY={currentFY} />
    </DashboardLayout>
  )
}

