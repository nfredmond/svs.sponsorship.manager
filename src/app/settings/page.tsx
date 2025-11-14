import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage application settings and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="mt-1 text-xs text-gray-400">{user?.id}</p>
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
                <div key={tier.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{tier.tier_name}</p>
                    <p className="text-sm text-gray-500">Level {tier.tier_level}</p>
                  </div>
                  <div className="text-right">
                    {tier.suggested_amount && (
                      <p className="font-semibold">${tier.suggested_amount}</p>
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

