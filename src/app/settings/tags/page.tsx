import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { Tag, Plus, Edit, Trash2 } from 'lucide-react'
import type { Tag as TagType } from '@/types/database'

async function getTags() {
  const supabase = await createClient()

  const { data: tags } = await supabase
    .from('tags')
    .select(`
      *,
      sponsor_tags(count)
    `)
    .order('tag_category', { ascending: true })

  return tags || []
}

export default async function TagsPage() {
  const tags = await getTags()

  // Group by category
  const tagsByCategory = tags.reduce((acc, tag) => {
    const category = tag.tag_category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(tag)
    return acc
  }, {} as Record<string, typeof tags>)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tags</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Organize and categorize sponsors with custom tags
            </p>
          </div>
          <Button className="bg-svs-gold hover:bg-svs-gold/90">
            <Plus className="mr-2 h-4 w-4" />
            New Tag
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{tags.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{Object.keys(tagsByCategory).length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Most Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold truncate">
                {tags.length > 0 ? tags[0].tag_name : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tags by Category */}
        <div className="space-y-6">
          {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {category}
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryTags.map(tag => (
                  <Card key={tag.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: tag.color }}
                            />
                            <h3 className="font-semibold">{tag.tag_name}</h3>
                          </div>
                          {tag.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {tag.description}
                            </p>
                          )}
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: tag.color + '20',
                              color: tag.color,
                              borderColor: tag.color + '40',
                            }}
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {tag.tag_name}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tags.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Tag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No tags yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create tags to organize and categorize your sponsors.
              </p>
              <Button className="bg-svs-gold hover:bg-svs-gold/90">
                <Plus className="mr-2 h-4 w-4" />
                Create First Tag
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Suggested Tags */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg">Suggested Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Award Sponsor', category: 'program', color: '#D4A443' },
                { name: 'In-Kind Only', category: 'type', color: '#6B8E9E' },
                { name: 'Board Contact', category: 'source', color: '#10B981' },
                { name: 'Event Sponsor', category: 'type', color: '#F59E0B' },
                { name: 'Renewal', category: 'status', color: '#3B82F6' },
                { name: 'VIP', category: 'status', color: '#8B5CF6' },
              ].map((suggestedTag, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  style={{
                    backgroundColor: suggestedTag.color + '20',
                    color: suggestedTag.color,
                    borderColor: suggestedTag.color + '40',
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {suggestedTag.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
