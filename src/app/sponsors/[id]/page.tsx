import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { ArrowLeft, Mail, Phone, Globe, MapPin, Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getSponsor(id: string) {
  const supabase = await createClient()
  
  const { data: sponsor } = await supabase
    .from('sponsors')
    .select('*')
    .eq('id', id)
    .single()

  if (!sponsor) return null

  const { data: sponsorships } = await supabase
    .from('sponsorships')
    .select('*, tier:sponsorship_tiers(*)')
    .eq('sponsor_id', id)
    .order('fiscal_year', { ascending: false })

  return { sponsor, sponsorships: sponsorships || [] }
}

export default async function SponsorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getSponsor(id)

  if (!data) notFound()

  const { sponsor, sponsorships } = data
  const totalContributions = sponsorships.reduce(
    (sum, s) => sum + Number(s.total_value),
    0
  )

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {sponsor.organization_name}
            </h1>
            <Badge variant={sponsor.is_active ? 'default' : 'secondary'} className="mt-2">
              {sponsor.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Button className="bg-svs-gold hover:bg-svs-gold/90">
            <Edit className="mr-2 h-4 w-4" />
            Edit Sponsor
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Sponsor Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sponsor.contact_person_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person</p>
                  <p className="mt-1">{sponsor.contact_person_name}</p>
                </div>
              )}
              {sponsor.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${sponsor.contact_email}`} className="text-svs-blue hover:underline">
                    {sponsor.contact_email}
                  </a>
                </div>
              )}
              {sponsor.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${sponsor.contact_phone}`}>{sponsor.contact_phone}</a>
                </div>
              )}
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
                  <p className="whitespace-pre-line">{sponsor.address}</p>
                </div>
              )}
              {sponsor.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="mt-1 whitespace-pre-line">{sponsor.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Contributions</p>
                <p className="text-2xl font-bold text-svs-gold mt-1">
                  {formatCurrency(totalContributions)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Sponsorships</p>
                <p className="text-2xl font-bold mt-1">{sponsorships.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sponsorship History */}
        <Card>
          <CardHeader>
            <CardTitle>Sponsorship History</CardTitle>
          </CardHeader>
          <CardContent>
            {sponsorships.length > 0 ? (
              <div className="space-y-4">
                {sponsorships.map((sponsorship) => (
                  <div
                    key={sponsorship.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{sponsorship.fiscal_year}</p>
                      <p className="text-sm text-gray-500">{sponsorship.tier?.tier_name}</p>
                      <Badge
                        variant={
                          sponsorship.status === 'Received'
                            ? 'default'
                            : sponsorship.status === 'Pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="mt-1"
                      >
                        {sponsorship.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(sponsorship.total_value)}
                      </p>
                      {sponsorship.payment_date && (
                        <p className="text-sm text-gray-500">
                          {formatDateShort(sponsorship.payment_date)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No sponsorship history</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

