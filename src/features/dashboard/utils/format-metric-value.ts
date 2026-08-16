interface ParsedMetricValue {
  target: number
  format: (current: number) => string
}

const LEADING_NUMBER_PATTERN = /^(-?\d[\d.,]*)(.*)$/

export function parseMetricValue(value: string | number): ParsedMetricValue {
  if (typeof value === 'number') {
    return {
      target: value,
      format: (current) => Math.round(current).toLocaleString('vi-VN'),
    }
  }

  const match = value.trim().match(LEADING_NUMBER_PATTERN)
  if (!match) {
    return { target: 0, format: () => value }
  }

  const [, rawNumber, matchedSuffix] = match
  if (!rawNumber) {
    return { target: 0, format: () => value }
  }
  const suffix = matchedSuffix ?? ''

  const decimalIndex = rawNumber.lastIndexOf(',')
  const decimals = decimalIndex === -1 ? 0 : rawNumber.length - decimalIndex - 1
  const normalized = rawNumber.replace(/\./g, '').replace(',', '.')
  const target = Number.parseFloat(normalized)

  if (Number.isNaN(target)) {
    return { target: 0, format: () => value }
  }

  return {
    target,
    format: (current) => `${current.toFixed(decimals).replace('.', ',')}${suffix}`,
  }
}
