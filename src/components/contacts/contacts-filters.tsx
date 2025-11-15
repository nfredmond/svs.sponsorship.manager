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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function ContactsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get('sponsor_status') || 'all'
  )
  const [primaryOnly, setPrimaryOnly] = useState(searchParams.get('primary_only') === 'true')

  // Update URL with current filters
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== 'false') {
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
    updateFilters({ sponsor_status: value })
  }

  const handlePrimaryOnlyChange = (checked: boolean) => {
    setPrimaryOnly(checked)
    updateFilters({ primary_only: checked.toString() })
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedStatus('all')
    setPrimaryOnly(false)
    router.push('/contacts')
  }

  const activeFilterCount = [
    searchQuery,
    selectedStatus !== 'all' ? selectedStatus : null,
    primaryOnly ? 'primary' : null,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts by name, email, phone, or title..."
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
      <div className="flex gap-3 items-center flex-wrap">
        {/* Sponsor Status Filter */}
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sponsor Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sponsor Statuses</SelectItem>
            <SelectItem value="Active">Active Sponsors</SelectItem>
            <SelectItem value="Pending">Pending Sponsors</SelectItem>
            <SelectItem value="Lapsed">Lapsed Sponsors</SelectItem>
            <SelectItem value="Prospect">Prospect Sponsors</SelectItem>
          </SelectContent>
        </Select>

        {/* Primary Only Checkbox */}
        <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white dark:bg-gray-950">
          <Checkbox
            id="primary-only"
            checked={primaryOnly}
            onCheckedChange={handlePrimaryOnlyChange}
          />
          <Label
            htmlFor="primary-only"
            className="text-sm font-medium cursor-pointer"
          >
            Primary contacts only
          </Label>
        </div>
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
              Sponsor: {selectedStatus}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleStatusChange('all')}
              />
            </Badge>
          )}
          {primaryOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Primary contacts only
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handlePrimaryOnlyChange(false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
