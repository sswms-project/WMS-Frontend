const TZ = 'Asia/Ho_Chi_Minh'

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TZ,
})

const ISO_DATE_PARTS_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TZ,
})

/** Format a Date to display string: dd/MM/yyyy */
export function formatDisplayDate(date: Date): string {
  return DISPLAY_DATE_FORMATTER.format(date)
}

/** Convert a Date to yyyy-MM-dd string for filter state / API conversion */
export function dateToIsoDateString(date: Date): string {
  const parts = ISO_DATE_PARTS_FORMATTER.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''
  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  return `${year}-${month}-${day}`
}

/** Parse a yyyy-MM-dd filter string back to a Date (VN timezone midnight) */
export function isoDateStringToDate(value: string): Date | undefined {
  if (!value) return undefined
  const date = new Date(`${value}T00:00:00+07:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}
