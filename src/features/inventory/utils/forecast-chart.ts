import type { ForecastPoint, StockHistoryPoint } from '../types/inventory.types'

export interface ForecastChartPoint {
  date: string
  actual: number | null
  forecast: number | null
}

/**
 * Merges the actuals series and the predicted series into one chart-ready array.
 * The last actual point carries both `actual` and `forecast` values so the two
 * lines visually connect instead of leaving a gap at the boundary date.
 */
export function mergeHistoryAndForecast(
  history: readonly StockHistoryPoint[],
  forecast: readonly ForecastPoint[]
): ForecastChartPoint[] {
  const actualPoints: ForecastChartPoint[] = history.map((point) => ({
    date: point.date,
    actual: point.quantity,
    forecast: null,
  }))

  const lastActual = history[history.length - 1]
  if (lastActual) {
    actualPoints[actualPoints.length - 1] = {
      date: lastActual.date,
      actual: lastActual.quantity,
      forecast: lastActual.quantity,
    }
  }

  const forecastPoints: ForecastChartPoint[] = forecast.map((point) => ({
    date: point.date,
    actual: null,
    forecast: point.predictedQuantity,
  }))

  return [...actualPoints, ...forecastPoints]
}
