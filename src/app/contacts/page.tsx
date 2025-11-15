import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import { Mail, Phone, Building2, ExternalLink, Users, Star, User } from 'lucide-react'
import Link from 'next/link'
import { ContactsFilters } from '@/components/contacts/contacts-filters'

interface Contact {
  id: string
  contact_name: string
  email: string | null
  phone: string | null
  title: string | null
  notes: string | null
  is_primary: boolean
  sponsor: {
    id: string
    organization_name: string
    current_status: string
    sponsor_type: string | null
  }
}

async function getFilteredContacts(filters: {
  search?: string
  sponsor_status?: string
  primary_only?: string
}) {
  const supabase = await createClient()

  // Start building query
  let query = supabase
    .from('contacts')
    .select(`
      *,
      sponsor:sponsors!inner(
        id,
        organization_name,
        current_status,
        sponsor_type
      )
    `)
    .order('contact_name', { ascending: true })

  // Apply search
  if (filters.search) {
    query = query.or(
      `contact_name.ilike.%${filters.search}%,` +
        `email.ilike.%${filters.search}%,` +
        `phone.ilike.%${filters.search}%,` +
        `title.ilike.%${filters.search}%`
    )
  }

  // Filter by sponsor status
  if (filters.sponsor_status && filters.sponsor_status !== 'all') {
    query = query.eq('sponsor.current_status', filters.sponsor_status)
  }

  // Filter to primary contacts only
  if (filters.primary_only === 'true') {
    query = query.eq('is_primary', true)
  }

  const { data: contacts, error } = await query

  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }

  return contacts as Contact[]
}

async function getContactStats(contacts: Contact[]) {
  const primaryCount = contacts.filter((c) => c.is_primary).length
  const withEmailCount = contacts.filter((c) => c.email).length
  const withPhoneCount = contacts.filter((c) => c.phone).length

  // Group by sponsor status
  const byStatus = contacts.reduce((acc, contact) => {
    const status = contact.sponsor.current_status
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total: contacts.length,
    primary: primaryCount,
    withEmail: withEmailCount,
    withPhone: withPhoneCount,
    byStatus,
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

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    sponsor_status?: string
    primary_only?: string
  }>
}) {
  const params = await searchParams
  const contacts = await getFilteredContacts(params)
  const stats = await getContactStats(contacts)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contacts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all sponsor contacts across your organization
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all sponsors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Primary Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-svs-gold">{stats.primary}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Main point of contact
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                With Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.withEmail}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.withEmail / stats.total) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                With Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.withPhone}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <ContactsFilters />

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {contacts.length} Contact{contacts.length !== 1 ? 's' : ''}
            </CardTitle>
            <CardDescription>
              {params.search || params.sponsor_status || params.primary_only
                ? 'Filtered results'
                : 'All contacts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contacts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow
                        key={contact.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {contact.contact_name}
                              </p>
                              {contact.is_primary && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-0.5 text-svs-gold border-svs-gold"
                                >
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/sponsors/${contact.sponsor.id}`}
                            className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-svs-gold dark:hover:text-svs-gold transition-colors"
                          >
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">
                                {contact.sponsor.organization_name}
                              </p>
                              {contact.sponsor.sponsor_type && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                  {contact.sponsor.sponsor_type}
                                </p>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          {contact.title ? (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {contact.title}
                            </span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {contact.email}
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <a
                                href={`tel:${contact.phone}`}
                                className="text-sm text-gray-700 dark:text-gray-300 hover:underline"
                              >
                                {contact.phone}
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(contact.sponsor.current_status)}
                            className={getStatusColor(contact.sponsor.current_status)}
                          >
                            {contact.sponsor.current_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/sponsors/${contact.sponsor.id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No contacts found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {params.search || params.sponsor_status || params.primary_only
                    ? 'Try adjusting your filters'
                    : 'Contacts will appear here when you add sponsors'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
