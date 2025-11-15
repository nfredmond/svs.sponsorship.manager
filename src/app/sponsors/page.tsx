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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Plus, ExternalLink, AlertCircle, Users, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDateShort } from '@/lib/utils'
import { SponsorsFilters } from '@/components/sponsors/sponsors-filters'

async function getFilteredSponsors(filters: {
  search?: string
  status?: string
  type?: string
  tag?: string
  sort?: string
}) {
  const supabase = await createClient()

  // Start building query
  let query = supabase
    .from('sponsors')
    .select(`
      *,
      current_tier:sponsorships(
        tier:sponsorship_tiers(tier_name),
        expiration_date,
        status
      ),
      contacts(
        id,
        contact_name,
        email,
        phone,
        is_primary
      ),
      tags:sponsor_tags(
        tag:tags(*)
      )
    `)
    .eq('is_active', true)

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('current_status', filters.status)
  }

  if (filters.type && filters.type !== 'all') {
    query = query.eq('sponsor_type', filters.type)
  }

  if (filters.tag && filters.tag !== 'all') {
    query = query.contains('sponsor_tags.tag_id', [filters.tag])
  }

  // Apply search
  if (filters.search) {
    query = query.or(
      `organization_name.ilike.%${filters.search}%,` +
        `contact_person_name.ilike.%${filters.search}%,` +
        `contact_email.ilike.%${filters.search}%,` +
        `website.ilike.%${filters.search}%`
    )
  }

  // Apply sorting
  switch (filters.sort) {
    case 'name':
      query = query.order('organization_name', { ascending: true })
      break
    case 'name-desc':
      query = query.order('organization_name', { ascending: false })
      break
    case 'status':
      query = query.order('current_status', { ascending: true })
      break
    case 'recent':
      query = query.order('created_at', { ascending: false })
      break
    case 'expiring':
      // For expiring soon, we'll sort client-side after fetching
      query = query.order('organization_name', { ascending: true })
      break
    default:
      query = query.order('organization_name', { ascending: true })
  }

  const { data: sponsors, error } = await query

  if (error) {
    console.error('Error fetching sponsors:', error)
    return []
  }

  // Process sponsors to get latest sponsorship info
  const processedSponsors = sponsors?.map((sponsor) => {
    // Get the most recent active/received sponsorship
    const activeSponsorships = sponsor.current_tier?.filter(
      (s: any) => s.status === 'Received' && s.expiration_date
    ) || []

    const latestSponsorship = activeSponsorships.sort((a: any, b: any) => {
      return new Date(b.expiration_date).getTime() - new Date(a.expiration_date).getTime()
    })[0]

    // Get primary contact
    const primaryContact = sponsor.contacts?.find((c: any) => c.is_primary) || sponsor.contacts?.[0]

    return {
      ...sponsor,
      latest_tier: latestSponsorship?.tier?.tier_name || null,
      expiration_date: latestSponsorship?.expiration_date || null,
      primary_contact: primaryContact,
      all_tags: sponsor.tags?.map((st: any) => st.tag) || [],
    }
  }) || []

  // Sort by expiration if requested
  if (filters.sort === 'expiring') {
    processedSponsors.sort((a, b) => {
      if (!a.expiration_date) return 1
      if (!b.expiration_date) return -1
      return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
    })
  }

  return processedSponsors
}

async function getTags() {
  const supabase = await createClient()

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .eq('is_active', true)
    .order('tag_name')

  return tags || []
}

async function getSponsorStats(sponsors: any[]) {
  const activeCount = sponsors.filter((s) => s.current_status === 'Active').length
  const lapsedCount = sponsors.filter((s) => s.current_status === 'Lapsed').length
  const prospectCount = sponsors.filter((s) => s.current_status === 'Prospect').length

  // Count sponsors expiring in next 90 days
  const today = new Date()
  const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)

  const expiringCount = sponsors.filter((s) => {
    if (!s.expiration_date) return false
    const expDate = new Date(s.expiration_date)
    return expDate >= today && expDate <= in90Days
  }).length

  return {
    total: sponsors.length,
    active: activeCount,
    lapsed: lapsedCount,
    prospect: prospectCount,
    expiring: expiringCount,
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'Active':
      return 'default' as const
    case 'Pending':
      return 'secondary' as const
    case 'Lapsed':
      return 'destructive' as const
    case 'Prospect':
      return 'outline' as const
    default:
      return 'secondary' as const
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Active':
      return 'text-green-600 dark:text-green-400'
    case 'Pending':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'Lapsed':
      return 'text-red-600 dark:text-red-400'
    case 'Prospect':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

export default async function SponsorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    type?: string
    tag?: string
    sort?: string
  }>
}) {
  const params = await searchParams
  const sponsors = await getFilteredSponsors(params)
  const tags = await getTags()
  const stats = await getSponsorStats(sponsors)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sponsors</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your sponsor organizations and contacts
            </p>
          </div>
          <Link href="/sponsors/new">
            <Button className="bg-svs-gold hover:bg-svs-gold/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Sponsor
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Sponsors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active organizations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current sponsors</p>
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
                {stats.expiring}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Next 90 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Lapsed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.lapsed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Need follow-up</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Prospects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.prospect}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Potential sponsors</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <SponsorsFilters tags={tags} />

        {/* Sponsors Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {sponsors.length} Sponsor{sponsors.length !== 1 ? 's' : ''}
            </CardTitle>
            <CardDescription>
              {params.search || params.status || params.type || params.tag
                ? 'Filtered results'
                : 'All active sponsors'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sponsors.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Primary Contact</TableHead>
                      <TableHead>Current Tier</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sponsors.map((sponsor) => {
                      const daysUntilExpiration = sponsor.expiration_date
                        ? Math.ceil(
                            (new Date(sponsor.expiration_date).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : null

                      return (
                        <TableRow key={sponsor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="font-medium">
                            <Link
                              href={`/sponsors/${sponsor.id}`}
                              className="text-gray-900 dark:text-gray-100 hover:text-svs-gold dark:hover:text-svs-gold transition-colors"
                            >
                              {sponsor.organization_name}
                            </Link>
                            {sponsor.sponsor_type && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                                {sponsor.sponsor_type}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(sponsor.current_status)}
                              className={getStatusColor(sponsor.current_status)}
                            >
                              {sponsor.current_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize text-sm text-gray-700 dark:text-gray-300">
                            {sponsor.sponsor_type || '-'}
                          </TableCell>
                          <TableCell>
                            {sponsor.primary_contact ? (
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {sponsor.primary_contact.contact_name}
                                </p>
                                {sponsor.primary_contact.email && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {sponsor.primary_contact.email}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {sponsor.latest_tier ? (
                              <span className="text-sm font-medium text-svs-gold">
                                {sponsor.latest_tier}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {sponsor.expiration_date ? (
                              <div>
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                  {formatDateShort(sponsor.expiration_date)}
                                </p>
                                {daysUntilExpiration !== null && (
                                  <p
                                    className={`text-xs mt-0.5 ${
                                      daysUntilExpiration < 0
                                        ? 'text-red-600 dark:text-red-400'
                                        : daysUntilExpiration < 90
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                  >
                                    {daysUntilExpiration < 0
                                      ? `${Math.abs(daysUntilExpiration)} days ago`
                                      : `${daysUntilExpiration} days`}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {sponsor.all_tags && sponsor.all_tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {sponsor.all_tags.slice(0, 2).map((tag: any) => (
                                  <Badge
                                    key={tag.id}
                                    variant="outline"
                                    style={{
                                      borderColor: tag.tag_color,
                                      color: tag.tag_color,
                                    }}
                                    className="text-xs"
                                  >
                                    {tag.tag_name}
                                  </Badge>
                                ))}
                                {sponsor.all_tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{sponsor.all_tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/sponsors/${sponsor.id}`}>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No sponsors found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {params.search || params.status || params.type || params.tag
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first sponsor'}
                </p>
                <Link href="/sponsors/new">
                  <Button className="bg-svs-gold hover:bg-svs-gold/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Sponsor
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
