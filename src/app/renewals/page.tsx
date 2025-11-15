import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import {
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

interface RenewalSponsor {
  id: string
  organization_name: string
  sponsor_type: string | null
  current_status: string
  sponsorship: {
    id: string
    total_value: number
    expiration_date: string
    tier: {
      tier_name: string
    }
  }
  primary_contact: {
    contact_name: string
    email: string | null
    phone: string | null
  } | null
  tags: Array<{
    tag_name: string
    tag_color: string
  }>
}

async function getRenewalPipeline() {
  const supabase = await createClient()
  const today = new Date()
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
  const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)

  // Get all sponsors with their latest sponsorship
  const { data: sponsors } = await supabase
    .from('sponsors')
    .select(`
      id,
      organization_name,
      sponsor_type,
      current_status,
      contacts(
        contact_name,
        email,
        phone,
        is_primary
      ),
      sponsorships!inner(
        id,
        total_value,
        expiration_date,
        status,
        tier:sponsorship_tiers(tier_name)
      ),
      tags:sponsor_tags(
        tag:tags(tag_name, tag_color)
      )
    `)
    .eq('is_active', true)
    .eq('sponsorships.status', 'Received')
    .not('sponsorships.expiration_date', 'is', null)

  // Process sponsors to get latest sponsorship and primary contact
  const processedSponsors: RenewalSponsor[] = sponsors?.map((sponsor: any) => {
    const latestSponsorship = sponsor.sponsorships
      ?.sort((a: any, b: any) => {
        return new Date(b.expiration_date).getTime() - new Date(a.expiration_date).getTime()
      })[0]

    const primaryContact = sponsor.contacts?.find((c: any) => c.is_primary) || sponsor.contacts?.[0]

    return {
      id: sponsor.id,
      organization_name: sponsor.organization_name,
      sponsor_type: sponsor.sponsor_type,
      current_status: sponsor.current_status,
      sponsorship: latestSponsorship,
      primary_contact: primaryContact || null,
      tags: sponsor.tags?.map((st: any) => st.tag) || [],
    }
  }).filter((s: RenewalSponsor) => s.sponsorship) || []

  // Categorize by expiration timeline
  const urgent = processedSponsors.filter((s) => {
    const expDate = new Date(s.sponsorship.expiration_date)
    return expDate >= today && expDate <= in30Days
  }).sort((a, b) =>
    new Date(a.sponsorship.expiration_date).getTime() - new Date(b.sponsorship.expiration_date).getTime()
  )

  const soon = processedSponsors.filter((s) => {
    const expDate = new Date(s.sponsorship.expiration_date)
    return expDate > in30Days && expDate <= in60Days
  }).sort((a, b) =>
    new Date(a.sponsorship.expiration_date).getTime() - new Date(b.sponsorship.expiration_date).getTime()
  )

  const upcoming = processedSponsors.filter((s) => {
    const expDate = new Date(s.sponsorship.expiration_date)
    return expDate > in60Days && expDate <= in90Days
  }).sort((a, b) =>
    new Date(a.sponsorship.expiration_date).getTime() - new Date(b.sponsorship.expiration_date).getTime()
  )

  const lapsed = processedSponsors.filter((s) => {
    const expDate = new Date(s.sponsorship.expiration_date)
    return expDate < today
  }).sort((a, b) =>
    new Date(b.sponsorship.expiration_date).getTime() - new Date(a.sponsorship.expiration_date).getTime()
  )

  // Calculate stats
  const totalValue = [...urgent, ...soon, ...upcoming].reduce(
    (sum, s) => sum + Number(s.sponsorship.total_value),
    0
  )
  const lapsedValue = lapsed.reduce((sum, s) => sum + Number(s.sponsorship.total_value), 0)

  return {
    urgent,
    soon,
    upcoming,
    lapsed,
    stats: {
      totalAtRisk: urgent.length + soon.length + upcoming.length,
      totalValue,
      lapsedCount: lapsed.length,
      lapsedValue,
    },
  }
}

function SponsorCard({ sponsor }: { sponsor: RenewalSponsor }) {
  const daysUntilExpiration = Math.ceil(
    (new Date(sponsor.sponsorship.expiration_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const isExpired = daysUntilExpiration < 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Sponsor Name */}
            <Link
              href={`/sponsors/${sponsor.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-svs-gold dark:hover:text-svs-gold transition-colors"
            >
              {sponsor.organization_name}
            </Link>

            {/* Tier and Value */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-svs-gold border-svs-gold">
                {sponsor.sponsorship.tier.tier_name}
              </Badge>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(sponsor.sponsorship.total_value)}
              </span>
              {sponsor.sponsor_type && (
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  • {sponsor.sponsor_type}
                </span>
              )}
            </div>

            {/* Tags */}
            {sponsor.tags && sponsor.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {sponsor.tags.slice(0, 3).map((tag: any, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    style={{ borderColor: tag.tag_color, color: tag.tag_color }}
                    className="text-xs"
                  >
                    {tag.tag_name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Contact Info */}
            {sponsor.primary_contact && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {sponsor.primary_contact.contact_name}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  {sponsor.primary_contact.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{sponsor.primary_contact.email}</span>
                    </div>
                  )}
                  {sponsor.primary_contact.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{sponsor.primary_contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Expiration info and actions */}
          <div className="text-right flex-shrink-0">
            <div
              className={`text-2xl font-bold mb-1 ${
                isExpired
                  ? 'text-red-600 dark:text-red-400'
                  : daysUntilExpiration <= 30
                  ? 'text-orange-600 dark:text-orange-400'
                  : daysUntilExpiration <= 60
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {isExpired ? Math.abs(daysUntilExpiration) : daysUntilExpiration}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {isExpired ? 'days ago' : 'days left'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {formatDateShort(sponsor.sponsorship.expiration_date)}
            </p>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/sponsors/${sponsor.id}`}>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
              <Button size="sm" className="bg-svs-gold hover:bg-svs-gold/90">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function RenewalsPage() {
  const pipeline = await getRenewalPipeline()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Renewal Pipeline</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage sponsor renewals and follow up with lapsed sponsors
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                At Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {pipeline.stats.totalAtRisk}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Expiring in 90 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Revenue at Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-svs-gold">
                {formatCurrency(pipeline.stats.totalValue)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Annual value
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
                {pipeline.stats.lapsedCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Need follow-up
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Lapsed Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(pipeline.stats.lapsedValue)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Potential recovery
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent - Expiring in 30 Days */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Urgent - Expiring in 30 Days
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pipeline.urgent.length} sponsors • Immediate action required
                </p>
              </div>
            </div>
            {pipeline.urgent.length > 0 && (
              <Button className="bg-svs-gold hover:bg-svs-gold/90">
                <Mail className="mr-2 h-4 w-4" />
                Email All ({pipeline.urgent.length})
              </Button>
            )}
          </div>

          {pipeline.urgent.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pipeline.urgent.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
                No sponsors expiring in the next 30 days
              </CardContent>
            </Card>
          )}
        </div>

        {/* Soon - Expiring in 31-60 Days */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Soon - Expiring in 31-60 Days
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pipeline.soon.length} sponsors • Plan outreach now
                </p>
              </div>
            </div>
            {pipeline.soon.length > 0 && (
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Email All ({pipeline.soon.length})
              </Button>
            )}
          </div>

          {pipeline.soon.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pipeline.soon.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
                No sponsors expiring in 31-60 days
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming - Expiring in 61-90 Days */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Upcoming - Expiring in 61-90 Days
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pipeline.upcoming.length} sponsors • Monitor and prepare
                </p>
              </div>
            </div>
          </div>

          {pipeline.upcoming.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pipeline.upcoming.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
                No sponsors expiring in 61-90 days
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lapsed Sponsors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Lapsed Sponsors
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pipeline.lapsed.length} sponsors • Recovery opportunity
                </p>
              </div>
            </div>
            {pipeline.lapsed.length > 0 && (
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Email All ({pipeline.lapsed.length})
              </Button>
            )}
          </div>

          {pipeline.lapsed.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pipeline.lapsed.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
                No lapsed sponsors - great job!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
