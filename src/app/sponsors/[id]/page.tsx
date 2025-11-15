import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  UserPlus,
  Tag,
  Calendar,
  FileText,
  Clock,
  Building2,
  AlertCircle,
  CheckCircle2,
  Upload,
  MessageSquare,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type {
  Sponsor,
  Contact,
  Sponsorship,
  Tag as TagType,
  SponsorInteraction,
  File as FileType
} from '@/types/database'

async function getSponsorData(id: string) {
  const supabase = await createClient()

  // Fetch sponsor
  const { data: sponsor } = await supabase
    .from('sponsors')
    .select('*')
    .eq('id', id)
    .single()

  if (!sponsor) return null

  // Fetch contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('sponsor_id', id)
    .order('is_primary', { ascending: false })

  // Fetch sponsorships with tier info
  const { data: sponsorships } = await supabase
    .from('sponsorships')
    .select(`
      *,
      tier:sponsorship_tiers(*)
    `)
    .eq('sponsor_id', id)
    .order('fiscal_year', { ascending: false })

  // Fetch tags
  const { data: sponsorTags } = await supabase
    .from('sponsor_tags')
    .select('tag_id, tags(*)')
    .eq('sponsor_id', id)

  const tags = sponsorTags?.map(st => st.tags).filter(Boolean) || []

  // Fetch interactions
  const { data: interactions } = await supabase
    .from('sponsor_interactions')
    .select('*, contact:contacts(contact_name)')
    .eq('sponsor_id', id)
    .order('interaction_date', { ascending: false })
    .limit(20)

  // Fetch files
  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('sponsor_id', id)
    .order('uploaded_at', { ascending: false })

  return {
    sponsor,
    contacts: contacts || [],
    sponsorships: sponsorships || [],
    tags: tags as TagType[],
    interactions: interactions || [],
    files: files || [],
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'Lapsed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'Prospect':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

function getSponsorTypeIcon(type: string) {
  return <Building2 className="h-4 w-4" />
}

export default async function SponsorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getSponsorData(id)

  if (!data) notFound()

  const { sponsor, contacts, sponsorships, tags, interactions, files } = data

  const totalContributions = sponsorships.reduce(
    (sum, s) => sum + Number(s.total_value),
    0
  )

  const activeSponsorship = sponsorships.find(
    s => s.status === 'Received' && s.expiration_date && new Date(s.expiration_date) >= new Date()
  )

  const primaryContact = contacts.find(c => c.is_primary) || contacts[0]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/sponsors">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sponsors
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {getSponsorTypeIcon(sponsor.sponsor_type)}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {sponsor.organization_name}
              </h1>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(sponsor.current_status)}>
                {sponsor.current_status}
              </Badge>
              {sponsor.sponsor_type && (
                <Badge variant="outline" className="capitalize">
                  {sponsor.sponsor_type}
                </Badge>
              )}
              {sponsor.industry && (
                <Badge variant="outline">{sponsor.industry}</Badge>
              )}
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  variant="outline"
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {tag.tag_name}
                </Badge>
              ))}
            </div>
            {sponsor.description && (
              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-3xl">
                {sponsor.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button className="bg-svs-gold hover:bg-svs-gold/90" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-svs-gold">
                {formatCurrency(totalContributions)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {sponsorships.length > 0 ? sponsorships[sponsorships.length - 1].fiscal_year : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {sponsorships.length} sponsorship{sponsorships.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {activeSponsorship?.tier?.tier_name || 'No Active Sponsorship'}
              </p>
              {activeSponsorship && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Expires {formatDateShort(activeSponsorship.expiration_date!)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Primary Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-sm">
                {primaryContact?.contact_name || 'No contact'}
              </p>
              {primaryContact?.email && (
                <a
                  href={`mailto:${primaryContact.email}`}
                  className="text-xs text-svs-blue hover:underline"
                >
                  {primaryContact.email}
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expiration Warning */}
        {activeSponsorship && activeSponsorship.expiration_date && (
          (() => {
            const daysUntilExpiration = Math.ceil(
              (new Date(activeSponsorship.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
            if (daysUntilExpiration <= 90 && daysUntilExpiration > 0) {
              return (
                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                  <CardContent className="flex items-center gap-3 pt-6">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                        Sponsorship expires in {daysUntilExpiration} days
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Consider sending a renewal reminder to {primaryContact?.contact_name || 'the sponsor'}.
                      </p>
                    </div>
                    <Button size="sm" className="ml-auto bg-yellow-600 hover:bg-yellow-700">
                      Send Renewal Email
                    </Button>
                  </CardContent>
                </Card>
              )
            } else if (daysUntilExpiration <= 0) {
              return (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <CardContent className="flex items-center gap-3 pt-6">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-200">
                        Sponsorship expired {Math.abs(daysUntilExpiration)} days ago
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Follow up with {primaryContact?.contact_name || 'the sponsor'} about renewal.
                      </p>
                    </div>
                    <Button size="sm" className="ml-auto bg-red-600 hover:bg-red-700">
                      Send Follow-up Email
                    </Button>
                  </CardContent>
                </Card>
              )
            }
            return null
          })()
        )}

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contacts">
              Contacts ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="sponsorships">
              Sponsorships ({sponsorships.length})
            </TabsTrigger>
            <TabsTrigger value="timeline">
              Timeline ({interactions.length})
            </TabsTrigger>
            <TabsTrigger value="files">
              Files ({files.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sponsor.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-svs-blue hover:underline"
                      >
                        {sponsor.website}
                      </a>
                    </div>
                  )}
                  {sponsor.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <p className="whitespace-pre-line text-sm">{sponsor.address}</p>
                    </div>
                  )}
                  {sponsor.geography && sponsor.geography.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Service Areas
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {sponsor.geography.map((geo, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {geo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {sponsor.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Notes
                      </p>
                      <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
                        {sponsor.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interactions.length > 0 ? (
                    <div className="space-y-3">
                      {interactions.slice(0, 5).map(interaction => (
                        <div key={interaction.id} className="border-l-2 border-svs-gold pl-3">
                          <p className="font-medium text-sm">{interaction.summary}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateShort(interaction.interaction_date)} •{' '}
                            {interaction.interaction_type}
                          </p>
                        </div>
                      ))}
                      {interactions.length > 5 && (
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          View all {interactions.length} interactions →
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      No interactions recorded
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage contacts for {sponsor.organization_name}
              </p>
              <Button size="sm" className="bg-svs-gold hover:bg-svs-gold/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {contacts.length > 0 ? (
                contacts.map(contact => (
                  <Card key={contact.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {contact.contact_name}
                            {contact.is_primary && (
                              <Star className="h-4 w-4 text-svs-gold fill-svs-gold" />
                            )}
                          </CardTitle>
                          {contact.title && (
                            <CardDescription>{contact.title}</CardDescription>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-svs-blue hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                        </div>
                      )}
                      {contact.preferred_contact_method && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          Prefers: {contact.preferred_contact_method}
                        </Badge>
                      )}
                      {contact.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {contact.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="md:col-span-2">
                  <CardContent className="text-center py-12">
                    <UserPlus className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No contacts added yet
                    </p>
                    <Button className="bg-svs-gold hover:bg-svs-gold/90">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add First Contact
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sponsorships Tab */}
          <TabsContent value="sponsorships" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sponsorship history for {sponsor.organization_name}
              </p>
              <Button size="sm" className="bg-svs-gold hover:bg-svs-gold/90">
                Add Sponsorship
              </Button>
            </div>

            {sponsorships.length > 0 ? (
              <div className="space-y-3">
                {sponsorships.map(sponsorship => (
                  <Card key={sponsorship.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {sponsorship.fiscal_year}
                            </h3>
                            <Badge
                              variant={
                                sponsorship.status === 'Received'
                                  ? 'default'
                                  : sponsorship.status === 'Pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {sponsorship.status}
                            </Badge>
                            {sponsorship.scot_mende_fund && (
                              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">
                                Scot Mende Fund
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {sponsorship.tier?.tier_name || 'Custom Sponsorship'}
                          </p>
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Amount</p>
                              <p className="font-semibold">{formatCurrency(sponsorship.total_value)}</p>
                            </div>
                            {sponsorship.payment_date && (
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Paid</p>
                                <p className="font-semibold">{formatDateShort(sponsorship.payment_date)}</p>
                              </div>
                            )}
                            {sponsorship.expiration_date && (
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Expires</p>
                                <p className="font-semibold">{formatDateShort(sponsorship.expiration_date)}</p>
                              </div>
                            )}
                            {sponsorship.source_type && (
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Source</p>
                                <p className="font-semibold capitalize">{sponsorship.source_type}</p>
                              </div>
                            )}
                          </div>
                          {sponsorship.notes && (
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                              {sponsorship.notes}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No sponsorships recorded
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Interaction history with {sponsor.organization_name}
              </p>
              <Button size="sm" className="bg-svs-gold hover:bg-svs-gold/90">
                <MessageSquare className="mr-2 h-4 w-4" />
                Log Interaction
              </Button>
            </div>

            {interactions.length > 0 ? (
              <div className="space-y-4">
                {interactions.map((interaction, idx) => (
                  <div key={interaction.id} className="relative">
                    {idx !== interactions.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-svs-gold/20 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-svs-gold" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{interaction.summary}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {formatDateShort(interaction.interaction_date)} •{' '}
                                  {interaction.interaction_type}
                                  {interaction.contact && ` • ${interaction.contact.contact_name}`}
                                </p>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {interaction.interaction_type}
                              </Badge>
                            </div>
                            {interaction.details && (
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {interaction.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No interactions logged yet
                  </p>
                  <Button className="bg-svs-gold hover:bg-svs-gold/90">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Log First Interaction
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Documents and files for {sponsor.organization_name}
              </p>
              <Button size="sm" className="bg-svs-gold hover:bg-svs-gold/90">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </div>

            {files.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {files.map(file => (
                  <Card key={file.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{file.file_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {file.file_type && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {file.file_type}
                              </Badge>
                            )}
                            {file.file_size && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {(file.file_size / 1024).toFixed(1)} KB
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Uploaded {formatDateShort(file.uploaded_at)}
                          </p>
                          {file.notes && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              {file.notes}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No files uploaded yet</p>
                  <Button className="bg-svs-gold hover:bg-svs-gold/90">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload First File
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
