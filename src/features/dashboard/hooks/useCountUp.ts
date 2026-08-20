'use client'

import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'

interface UseCountUpOptions {
  duration?: number
}

export function useCountUp(target: number, { duration = 1.2 }: UseCountUpOptions = {}) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: setCurrent,
    })

    return () => controls.stop()
  }, [target, duration])

  return current
}
