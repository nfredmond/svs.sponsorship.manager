'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import Link from 'next/link'

export default function FiscalYearSettingsPage() {
  const [fiscalYears, setFiscalYears] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchFiscalYears()
  }, [])

  const fetchFiscalYears = async () => {
    const { data } = await supabase
      .from('fiscal_year_settings')
      .select('*')
      .order('fiscal_year', { ascending: false })

    setFiscalYears(data || [])
    setLoading(false)
  }

  const updateGoal = async (id: string, goalAmount: number) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('fiscal_year_settings')
        .update({ goal_amount: goalAmount })
        .eq('id', id)

      if (error) throw error

      toast.success('Goal updated successfully!')
      fetchFiscalYears()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const setCurrentFiscalYear = async (fiscalYear: string) => {
    setSaving(true)
    try {
      // Set all to not current
      await supabase
        .from('fiscal_year_settings')
        .update({ is_current: false })
        .neq('fiscal_year', '')

      // Set selected to current
      const { error } = await supabase
        .from('fiscal_year_settings')
        .update({ is_current: true })
        .eq('fiscal_year', fiscalYear)

      if (error) throw error

      toast.success('Current fiscal year updated!')
      fetchFiscalYears()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Fiscal Year Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage fiscal year goals and settings. Fiscal years run from July 1 to June 30.
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">Loading...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {fiscalYears.map((fy) => (
              <Card key={fy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      Fiscal Year {fy.fiscal_year}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {fy.is_current && (
                        <Badge className="bg-svs-gold">Current</Badge>
                      )}
                      {!fy.is_current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentFiscalYear(fy.fiscal_year)}
                          disabled={saving}
                        >
                          Set as Current
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Goal Amount</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={fy.goal_amount}
                          onChange={(e) => {
                            const updated = fiscalYears.map((f) =>
                              f.id === fy.id
                                ? { ...f, goal_amount: e.target.value }
                                : f
                            )
                            setFiscalYears(updated)
                          }}
                        />
                        <Button
                          onClick={() => updateGoal(fy.id, parseFloat(fy.goal_amount))}
                          disabled={saving}
                          className="bg-svs-gold hover:bg-svs-gold/90"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-300 py-2">
                        {new Date(fy.start_date).toLocaleDateString()} -{' '}
                        {new Date(fy.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

