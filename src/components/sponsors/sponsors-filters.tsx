'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Tag {
  id: string
  tag_name: string
  tag_color: string
}

interface SponsorsFiltersProps {
  tags: Tag[]
}

export function SponsorsFilters({ tags }: SponsorsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all')
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'all')
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'name')

  // Update URL with current filters
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchQuery })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    updateFilters({ status: value })
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    updateFilters({ type: value })
  }

  const handleTagChange = (value: string) => {
    setSelectedTag(value)
    updateFilters({ tag: value })
  }

  const handleSortChange = (value: string) => {
    setSelectedSort(value)
    updateFilters({ sort: value })
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedStatus('all')
    setSelectedType('all')
    setSelectedTag('all')
    setSelectedSort('name')
    router.push('/sponsors')
  }

  const activeFilterCount = [
    searchQuery,
    selectedStatus !== 'all' ? selectedStatus : null,
    selectedType !== 'all' ? selectedType : null,
    selectedTag !== 'all' ? selectedTag : null,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search sponsors by name, contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear All ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="grid gap-3 md:grid-cols-4">
        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Lapsed">Lapsed</SelectItem>
            <SelectItem value="Prospect">Prospect</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="agency">Agency</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
          </SelectContent>
        </Select>

        {/* Tag Filter */}
        <Select value={selectedTag} onValueChange={handleTagChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.tag_color }}
                  />
                  {tag.tag_name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={selectedSort} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchQuery}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSearchQuery('')}
              />
            </Badge>
          )}
          {selectedStatus !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {selectedStatus}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleStatusChange('all')}
              />
            </Badge>
          )}
          {selectedType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {selectedType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTypeChange('all')}
              />
            </Badge>
          )}
          {selectedTag !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tag: {tags.find(t => t.id === selectedTag)?.tag_name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTagChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
