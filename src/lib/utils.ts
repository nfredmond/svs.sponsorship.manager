import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getCurrentFiscalYear(): string {
  const today = new Date()
  const month = today.getMonth()
  const year = today.getFullYear()
  
  // Fiscal year starts July 1
  if (month >= 6) {
    return `${year}/${year + 1}`
  } else {
    return `${year - 1}/${year}`
  }
}

export function getFiscalYearOptions(yearsBack: number = 5): string[] {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  const startYear = currentMonth >= 6 ? currentYear : currentYear - 1
  const fiscalYears: string[] = []
  
  for (let i = 0; i <= yearsBack; i++) {
    const year = startYear - i
    fiscalYears.push(`${year}/${year + 1}`)
  }
  
  return fiscalYears
}

