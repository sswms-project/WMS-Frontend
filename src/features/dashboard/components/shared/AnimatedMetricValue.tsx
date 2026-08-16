'use client'

import { useCountUp } from '../../hooks/useCountUp'
import { parseMetricValue } from '../../utils/format-metric-value'

interface AnimatedMetricValueProps {
  value: string | number
  className?: string
}

export function AnimatedMetricValue({ value, className }: AnimatedMetricValueProps) {
  const { target, format } = parseMetricValue(value)
  const current = useCountUp(target)

  return <p className={className}>{format(current)}</p>
}
