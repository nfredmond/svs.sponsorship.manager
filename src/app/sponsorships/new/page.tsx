'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getCurrentFiscalYear } from '@/lib/fiscal-year'
import { calculateRenewalDate } from '@/lib/fiscal-year'

export default function NewSponsorshipPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [sponsors, setSponsors] = useState<any[]>([])
  const [tiers, setTiers] = useState<any[]>([])
  const [renewalDate, setRenewalDate] = useState<string>('')
  const [formData, setFormData] = useState({
    sponsor_id: '',
    sponsorship_tier_id: '',
    fiscal_year: getCurrentFiscalYear(),
    sponsorship_type: 'Monetary',
    monetary_amount: '',
    in_kind_description: '',
    in_kind_value: '',
    payment_date: '',
    payment_method: '',
    payment_reference: '',
    status: 'Pending',
    scot_mende_fund: false,
    scot_mende_amount: '',
    notes: '',
  })

  // Calculate renewal date when payment date changes
  useEffect(() => {
    if (formData.payment_date) {
      const renewal = calculateRenewalDate(formData.payment_date)
      setRenewalDate(renewal.toISOString().split('T')[0])
    }
  }, [formData.payment_date])

  useEffect(() => {
    fetchSponsorsAndTiers()
  }, [])

  const fetchSponsorsAndTiers = async () => {
    const { data: sponsorsData } = await supabase
      .from('sponsors')
      .select('*')
      .eq('is_active', true)
      .order('organization_name')

    const { data: tiersData } = await supabase
      .from('sponsorship_tiers')
      .select('*')
      .eq('is_active', true)
      .order('tier_level')

    setSponsors(sponsorsData || [])
    setTiers(tiersData || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        monetary_amount: formData.monetary_amount ? parseFloat(formData.monetary_amount) : 0,
        in_kind_value: formData.in_kind_value ? parseFloat(formData.in_kind_value) : 0,
        scot_mende_amount: formData.scot_mende_amount ? parseFloat(formData.scot_mende_amount) : 0,
        renewal_date: renewalDate || null,
      }

      const { error } = await supabase.from('sponsorships').insert([data])

      if (error) throw error

      toast.success('Sponsorship created successfully!')
      router.push('/sponsorships')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/sponsorships">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sponsorships
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Sponsorship</h1>
          <p className="text-gray-500 mt-1">Record a new sponsorship or donation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sponsorship Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sponsor <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.sponsor_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sponsor_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sponsor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sponsors.map((sponsor) => (
                        <SelectItem key={sponsor.id} value={sponsor.id}>
                          {sponsor.organization_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sponsorship Tier</Label>
                  <Select
                    value={formData.sponsorship_tier_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sponsorship_tier_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.tier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fiscal Year</Label>
                  <Input
                    value={formData.fiscal_year}
                    onChange={(e) =>
                      setFormData({ ...formData, fiscal_year: e.target.value })
                    }
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.sponsorship_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sponsorship_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monetary">Monetary</SelectItem>
                      <SelectItem value="In-Kind">In-Kind</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.sponsorship_type === 'Monetary' || formData.sponsorship_type === 'Both') && (
                  <div className="space-y-2">
                    <Label>Monetary Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.monetary_amount}
                      onChange={(e) =>
                        setFormData({ ...formData, monetary_amount: e.target.value })
                      }
                    />
                  </div>
                )}

                {(formData.sponsorship_type === 'In-Kind' || formData.sponsorship_type === 'Both') && (
                  <>
                    <div className="space-y-2">
                      <Label>In-Kind Value</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.in_kind_value}
                        onChange={(e) =>
                          setFormData({ ...formData, in_kind_value: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>In-Kind Description</Label>
                      <Textarea
                        placeholder="Describe the in-kind contribution"
                        value={formData.in_kind_description}
                        onChange={(e) =>
                          setFormData({ ...formData, in_kind_description: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                  />
                  {renewalDate && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Renewal Date: {new Date(renewalDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      <span className="ml-1 text-gray-500">(Payment date + 1 year, end of month)</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Input
                    placeholder="Check, Square, etc."
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Reference</Label>
                  <Input
                    placeholder="Check #, Transaction ID"
                    value={formData.payment_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_reference: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scot_mende"
                      checked={formData.scot_mende_fund}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, scot_mende_fund: checked as boolean })
                      }
                    />
                    <Label htmlFor="scot_mende" className="cursor-pointer">
                      Includes Scot Mende Memorial Fund contribution
                    </Label>
                  </div>
                  {formData.scot_mende_fund && (
                    <div className="space-y-2">
                      <Label>Scot Mende Fund Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.scot_mende_amount}
                        onChange={(e) =>
                          setFormData({ ...formData, scot_mende_amount: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/sponsorships">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-svs-gold hover:bg-svs-gold/90"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Sponsorship'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

