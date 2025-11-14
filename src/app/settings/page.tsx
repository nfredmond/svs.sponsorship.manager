import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { Settings2, Calendar, Users } from 'lucide-react'
import Link from 'next/link'

async function getSettings() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: tiers } = await supabase
    .from('sponsorship_tiers')
    .select('*')
    .order('tier_level')

  return { user, tiers: tiers || [] }
}

export default async function SettingsPage() {
  const { user, tiers } = await getSettings()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage application settings and preferences
          </p>
        </div>

        {/* Settings Navigation */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/settings/fiscal-years">
            <Card className="cursor-pointer hover:border-svs-gold transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-svs-gold/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-svs-gold" />
                  </div>
                  <CardTitle className="text-lg">Fiscal Year Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage fiscal year goals and date ranges
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <CardTitle className="text-lg">User Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon - Manage user roles and access
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Settings2 className="h-5 w-5 text-gray-400" />
                </div>
                <CardTitle className="text-lg">General Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon - Organization info and preferences
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User ID</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{user?.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sponsorship Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div key={tier.id} className="flex justify-between items-center p-3 border dark:border-gray-700 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{tier.tier_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Level {tier.tier_level}</p>
                  </div>
                  <div className="text-right">
                    {tier.suggested_amount && (
                      <p className="font-semibold text-gray-900 dark:text-gray-100">${tier.suggested_amount}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

