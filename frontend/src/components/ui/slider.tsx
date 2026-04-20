'use client'

import * as React from 'react'
import { Direction, Range, getTrackBackground } from 'react-range'
import { cn } from '@/lib/utils'

interface SliderProps {
  value?: [number, number]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: [number, number]) => void
  className?: string
}

function Slider({
  value = [0, 100],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
}: SliderProps) {
  const [isRTL, setIsRTL] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)

  React.useEffect(() => {
    const updateRTL = () => {
      if (typeof document !== 'undefined') {
        const htmlDir = document.documentElement.getAttribute('dir')
        setIsRTL(htmlDir === 'rtl')
      }
    }

    updateRTL()

    const observer = new MutationObserver(updateRTL)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    })

    return () => observer.disconnect()
  }, [])

  const normalizedMin = Number.isFinite(min) ? min : 0
  const normalizedMax = Number.isFinite(max) ? max : 100

  const safeValues = React.useMemo<[number, number]>(() => {
    const first = Math.max(normalizedMin, Math.min(value?.[0] ?? normalizedMin, normalizedMax))
    const second = Math.max(first, Math.min(value?.[1] ?? normalizedMax, normalizedMax))
    return [first, second]
  }, [value, normalizedMin, normalizedMax])

  const [internalValues, setInternalValues] = React.useState<[number, number]>(safeValues)

  React.useEffect(() => {
    if (!isDragging) {
      setInternalValues(safeValues)
    }
  }, [safeValues, isDragging])

  const handleChange = (nextValues: number[]) => {
    const nextRange: [number, number] = [nextValues[0], nextValues[1]]
    setIsDragging(true)
    setInternalValues(nextRange)
    onValueChange?.(nextRange)
  }

  const handleFinalChange = (nextValues: number[]) => {
    const nextRange: [number, number] = [nextValues[0], nextValues[1]]
    setIsDragging(false)
    setInternalValues(nextRange)
    onValueChange?.(nextRange)
  }

  return (
    <div className={cn('w-full py-2', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <Range
        values={internalValues}
        step={step}
        min={normalizedMin}
        max={normalizedMax}
        rtl={isRTL}
        onChange={handleChange}
        onFinalChange={handleFinalChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="h-2.5 w-full rounded-full"
            style={{
              ...props.style,
              background: getTrackBackground({
                values: internalValues,
                colors: ['#D9EEEB', '#2A9D8F', '#D9EEEB'],
                min: normalizedMin,
                max: normalizedMax,
                direction: isRTL ? Direction.Left : Direction.Right,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            className="block size-5 rounded-full border-2 border-white bg-[#2A9D8F] shadow-[0_4px_14px_rgba(42,157,143,0.35)] cursor-grab active:cursor-grabbing transition-transform duration-100 hover:scale-110 active:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2A9D8F]/35"
          />
        )}
      />
    </div>
  )
}

export { Slider }
