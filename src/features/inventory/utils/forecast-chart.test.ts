import { describe, expect, it } from 'vitest'
import { mergeHistoryAndForecast } from './forecast-chart'

describe('mergeHistoryAndForecast', () => {
  it('marks history points as actual and forecast points as forecast', () => {
    const history = [
      { date: '2026-08-01', quantity: 100 },
      { date: '2026-08-02', quantity: 90 },
    ]
    const forecast = [
      { date: '2026-08-03', predictedQuantity: 85 },
      { date: '2026-08-04', predictedQuantity: 80 },
    ]

    const result = mergeHistoryAndForecast(history, forecast)

    expect(result).toEqual([
      { date: '2026-08-01', actual: 100, forecast: null },
      { date: '2026-08-02', actual: 90, forecast: 90 },
      { date: '2026-08-03', actual: null, forecast: 85 },
      { date: '2026-08-04', actual: null, forecast: 80 },
    ])
  })

  it('connects the two lines by giving the last actual point a forecast value too', () => {
    const history = [{ date: '2026-08-02', quantity: 90 }]
    const forecast = [{ date: '2026-08-03', predictedQuantity: 85 }]

    const result = mergeHistoryAndForecast(history, forecast)

    expect(result[0]).toEqual({ date: '2026-08-02', actual: 90, forecast: 90 })
  })

  it('handles empty history gracefully', () => {
    const forecast = [{ date: '2026-08-03', predictedQuantity: 85 }]

    expect(mergeHistoryAndForecast([], forecast)).toEqual([
      { date: '2026-08-03', actual: null, forecast: 85 },
    ])
  })

  it('handles empty forecast gracefully', () => {
    const history = [{ date: '2026-08-01', quantity: 100 }]

    expect(mergeHistoryAndForecast(history, [])).toEqual([
      { date: '2026-08-01', actual: 100, forecast: 100 },
    ])
  })
})
