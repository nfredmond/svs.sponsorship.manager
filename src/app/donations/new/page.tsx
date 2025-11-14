'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewDonationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    donation_amount: '',
    donation_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    payment_reference: '',
    is_anonymous: false,
    is_recurring: false,
    recurring_frequency: '',
    purpose: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        donation_amount: parseFloat(formData.donation_amount),
        recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null,
      }

      const { error } = await supabase.from('individual_donations').insert([data])

      if (error) throw error

      toast.success('Donation recorded successfully!')
      router.push('/donations')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/donations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donations
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Donation</h1>
          <p className="text-gray-500 mt-1">Record an individual donation</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="donor_name">
                    Donor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="donor_name"
                    value={formData.donor_name}
                    onChange={(e) =>
                      setFormData({ ...formData, donor_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donor_email">Email</Label>
                  <Input
                    id="donor_email"
                    type="email"
                    value={formData.donor_email}
                    onChange={(e) =>
                      setFormData({ ...formData, donor_email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donation_amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="donation_amount"
                    type="number"
                    step="0.01"
                    value={formData.donation_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, donation_amount: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donation_date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="donation_date"
                    type="date"
                    value={formData.donation_date}
                    onChange={(e) =>
                      setFormData({ ...formData, donation_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Input
                    id="payment_method"
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_reference">Payment Reference</Label>
                  <Input
                    id="payment_reference"
                    value={formData.payment_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_reference: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_anonymous"
                      checked={formData.is_anonymous}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_anonymous: checked as boolean })
                      }
                    />
                    <Label htmlFor="is_anonymous" className="cursor-pointer">
                      Anonymous donation
                    </Label>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/donations">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-svs-gold hover:bg-svs-gold/90"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Donation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

