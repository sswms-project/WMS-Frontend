import { describe, expect, it } from 'vitest'
import { personnelImportResultsCsv } from './PersonnelImportPage'

describe('personnelImportResultsCsv', () => {
  it('prevents spreadsheet formula execution in exported cells', () => {
    const csv = personnelImportResultsCsv([
      { rowNumber: 2, email: '+formula@example.com', deliveryStatus: '=CMD()' },
    ])

    expect(csv).toContain('"\'+formula@example.com"')
    expect(csv).toContain('"\'=CMD()"')
  })

  it('escapes embedded quotes without changing normal values', () => {
    const csv = personnelImportResultsCsv([
      { rowNumber: 2, email: 'staff@example.com', deliveryStatus: 'Sent "once"' },
    ])

    expect(csv).toContain('"staff@example.com"')
    expect(csv).toContain('"Sent ""once"""')
  })
})
