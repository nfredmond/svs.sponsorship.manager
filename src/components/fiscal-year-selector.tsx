'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getFiscalYearOptions } from '@/lib/fiscal-year'
import { useRouter, useSearchParams } from 'next/navigation'

interface FiscalYearSelectorProps {
  currentFY: string
}

export function FiscalYearSelector({ currentFY }: FiscalYearSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedFY = searchParams.get('fy') || currentFY
  const fiscalYears = getFiscalYearOptions(3, 1)

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams)
    if (year === currentFY) {
      params.delete('fy')
    } else {
      params.set('fy', year)
    }
    const newSearch = params.toString()
    router.push(`${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Fiscal Year:
      </label>
      <Select value={selectedFY} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fiscalYears.map((fy) => (
            <SelectItem key={fy} value={fy}>
              {fy} {fy === currentFY && '(Current)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

