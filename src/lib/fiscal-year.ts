import { addYears, endOfMonth, parseISO } from 'date-fns'

/**
 * Calculate renewal date based on payment date
 * Rule: Payment date + 1 year + end of that month
 * Example: Payment on April 6, 2025 → Renewal date April 30, 2026
 */
export function calculateRenewalDate(paymentDate: string | Date): Date {
  const payment = typeof paymentDate === 'string' ? parseISO(paymentDate) : paymentDate
  
  // Add one year to the payment date
  const oneYearLater = addYears(payment, 1)
  
  // Get the last day of that month
  const renewalDate = endOfMonth(oneYearLater)
  
  return renewalDate
}

/**
 * Get the current fiscal year based on today's date
 * Fiscal year runs from July 1 to June 30
 */
export function getCurrentFiscalYear(): string {
  const today = new Date()
  const month = today.getMonth() // 0-indexed (0 = January, 6 = July)
  const year = today.getFullYear()
  
  // If we're in July-December (months 6-11), we're in the first half of the fiscal year
  if (month >= 6) {
    return `${year}/${year + 1}`
  } else {
    // If we're in January-June (months 0-5), we're in the second half
    return `${year - 1}/${year}`
  }
}

/**
 * Get a list of fiscal years for the selector
 * @param yearsBack How many years back to include
 * @param yearsForward How many years forward to include
 */
export function getFiscalYearOptions(yearsBack: number = 3, yearsForward: number = 1): string[] {
  const currentFY = getCurrentFiscalYear()
  const currentStartYear = parseInt(currentFY.split('/')[0])
  
  const fiscalYears: string[] = []
  
  // Add past years
  for (let i = yearsBack; i > 0; i--) {
    const year = currentStartYear - i
    fiscalYears.push(`${year}/${year + 1}`)
  }
  
  // Add current year
  fiscalYears.push(currentFY)
  
  // Add future years
  for (let i = 1; i <= yearsForward; i++) {
    const year = currentStartYear + i
    fiscalYears.push(`${year}/${year + 1}`)
  }
  
  return fiscalYears
}

/**
 * Check if a date falls within a fiscal year
 */
export function isDateInFiscalYear(date: string | Date, fiscalYear: string): boolean {
  const checkDate = typeof date === 'string' ? parseISO(date) : date
  const [startYear, endYear] = fiscalYear.split('/').map(Number)
  
  const fyStart = new Date(startYear, 6, 1) // July 1st
  const fyEnd = new Date(endYear, 5, 30) // June 30th
  
  return checkDate >= fyStart && checkDate <= fyEnd
}

/**
 * Get the date range for a fiscal year
 */
export function getFiscalYearDates(fiscalYear: string): { start: Date; end: Date } {
  const [startYear, endYear] = fiscalYear.split('/').map(Number)
  
  return {
    start: new Date(startYear, 6, 1), // July 1st
    end: new Date(endYear, 5, 30, 23, 59, 59), // June 30th
  }
}

