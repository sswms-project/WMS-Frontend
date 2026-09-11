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

export interface ForecastStats {
  currentQuantity: number
  currentDate: string
  endQuantity: number
  endDate: string
  changePercent: number
  avgDailyChange: number
  lowestForecast: number
  lowestForecastDate: string
}

/**
 * Derives at-a-glance metrics from the merged chart series: current stock,
 * where the forecast lands at the end of the horizon, its average daily
 * drift, and the lowest point the forecast dips to. Returns null when there
 * isn't enough data (no actuals yet, or no forecast horizon) to compute them.
 */
type ForecastedPoint = ForecastChartPoint & { forecast: number }

/** Narrows away the nullable series shape so the arithmetic below needs no casts. */
function hasForecast(point: ForecastChartPoint): point is ForecastedPoint {
  return point.forecast !== null
}

export function computeForecastStats(
  chartData: readonly ForecastChartPoint[]
): ForecastStats | null {
  const lastActualIndex = chartData.findLastIndex((point) => point.actual !== null)
  if (lastActualIndex === -1) return null

  const current = chartData[lastActualIndex]
  if (current?.actual == null) return null

  const forecastPoints = chartData.slice(lastActualIndex).filter(hasForecast)
  const lastForecast = forecastPoints[forecastPoints.length - 1]
  if (!lastForecast || forecastPoints.length < 2) return null

  const currentQuantity = current.actual
  const endQuantity = lastForecast.forecast
  const horizonDays = forecastPoints.length - 1

  const lowest = forecastPoints.reduce((min, point) =>
    point.forecast < min.forecast ? point : min
  )

  return {
    currentQuantity,
    currentDate: current.date,
    endQuantity,
    endDate: lastForecast.date,
    changePercent:
      currentQuantity === 0 ? 0 : ((endQuantity - currentQuantity) / currentQuantity) * 100,
    avgDailyChange: horizonDays === 0 ? 0 : (endQuantity - currentQuantity) / horizonDays,
    lowestForecast: lowest.forecast,
    lowestForecastDate: lowest.date,
  }
}
