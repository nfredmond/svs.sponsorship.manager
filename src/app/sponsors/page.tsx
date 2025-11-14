import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Plus, Search, Mail, Phone, ExternalLink } from 'lucide-react'
import Link from 'next/link'

async function getSponsors() {
  const supabase = await createClient()
  
  const { data: sponsors, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_active', true)
    .order('organization_name')

  if (error) {
    console.error('Error fetching sponsors:', error)
    return []
  }

  return sponsors
}

export default async function SponsorsPage() {
  const sponsors = await getSponsors()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sponsors</h1>
            <p className="text-gray-500 mt-1">
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sponsors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sponsors.length}</div>
              <p className="text-xs text-muted-foreground">Active organizations</p>
            </CardContent>
          </Card>
        </div>

        {/* Sponsors Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sponsors</CardTitle>
          </CardHeader>
          <CardContent>
            {sponsors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsors.map((sponsor) => (
                    <TableRow key={sponsor.id}>
                      <TableCell className="font-medium">
                        {sponsor.organization_name}
                      </TableCell>
                      <TableCell>{sponsor.contact_person_name || '-'}</TableCell>
                      <TableCell>
                        {sponsor.contact_email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{sponsor.contact_email}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {sponsor.contact_phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{sponsor.contact_phone}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sponsor.is_active ? 'default' : 'secondary'}>
                          {sponsor.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/sponsors/${sponsor.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No sponsors found</p>
                <Link href="/sponsors/new">
                  <Button className="mt-4 bg-svs-gold hover:bg-svs-gold/90">
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

