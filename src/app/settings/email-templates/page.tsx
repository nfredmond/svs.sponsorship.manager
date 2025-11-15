import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { Mail, Plus, Edit, Copy, Trash2, Eye, Clock } from 'lucide-react'
import Link from 'next/link'
import type { EmailTemplate } from '@/types/database'

async function getEmailTemplates() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .order('template_category', { ascending: true })

  return templates || []
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'Welcome':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'Payment Confirmation':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'Renewal Reminder':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'Lapsed Follow-up':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'Thank You':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

export default async function EmailTemplatesPage() {
  const templates = await getEmailTemplates()

  const activeTemplates = templates.filter(t => t.is_active)
  const inactiveTemplates = templates.filter(t => !t.is_active)

  // Group by category
  const templatesByCategory = templates.reduce((acc, template) => {
    const category = template.template_category || 'Custom'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {} as Record<string, EmailTemplate[]>)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Email Templates
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage email templates for automated communications
            </p>
          </div>
          <Button className="bg-svs-gold hover:bg-svs-gold/90">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{templates.length}</p>
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
                {activeTemplates.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                {inactiveTemplates.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{Object.keys(templatesByCategory).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Merge Fields Info */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Available Merge Fields
            </CardTitle>
            <CardDescription>
              Use these placeholders in your email templates to personalize messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                '{{contact_name}}',
                '{{organization_name}}',
                '{{tier_name}}',
                '{{amount}}',
                '{{payment_date}}',
                '{{expiration_date}}',
                '{{start_date}}',
                '{{receipt_number}}',
                '{{sponsor_chair_name}}',
                '{{sponsor_chair_email}}',
                '{{payment_link}}',
                '{{fiscal_year}}',
              ].map(field => (
                <code
                  key={field}
                  className="px-2 py-1 bg-white dark:bg-gray-900 rounded text-xs font-mono border"
                >
                  {field}
                </code>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates by Category */}
        <div className="space-y-6">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {category}
                </h2>
                <Badge className={getCategoryColor(category)}>{categoryTemplates.length}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {categoryTemplates.map(template => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{template.template_name}</CardTitle>
                            {!template.is_active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <CardDescription className="line-clamp-1">
                            {template.subject_line}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Body Preview */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm">
                        <div
                          className="line-clamp-3 text-gray-600 dark:text-gray-400"
                          dangerouslySetInnerHTML={{
                            __html: template.body_html.replace(/<[^>]*>/g, ''),
                          }}
                        />
                      </div>

                      {/* Merge Fields */}
                      {template.merge_fields && template.merge_fields.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Uses {template.merge_fields.length} merge field
                            {template.merge_fields.length !== 1 ? 's' : ''}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {template.merge_fields.slice(0, 3).map((field, idx) => (
                              <code
                                key={idx}
                                className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono"
                              >
                                {field}
                              </code>
                            ))}
                            {template.merge_fields.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{template.merge_fields.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Send Timing */}
                      {template.send_timing && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{template.send_timing}</span>
                        </div>
                      )}

                      <Separator />

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No email templates yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create email templates to automate your sponsorship communications.
              </p>
              <Button className="bg-svs-gold hover:bg-svs-gold/90">
                <Plus className="mr-2 h-4 w-4" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-svs-gold/10 border-svs-gold/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Welcome Email
              </Button>
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Renewal Reminder
              </Button>
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Thank You Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
