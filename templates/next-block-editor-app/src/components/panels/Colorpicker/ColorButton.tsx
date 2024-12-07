import { cn } from '@/lib/utils'
import { memo, useCallback } from 'react'

export type ColorButtonProps = {
  color?: string
  active?: boolean
  onColorChange?: (color: string) => void // eslint-disable-line no-unused-vars
}

export const ColorButton = memo(({ color, active, onColorChange }: ColorButtonProps) => {
  const wrapperClassName = cn(
    'flex items-center justify-center px-1.5 py-1.5 rounded-xl group',
    !active && 'hover:bg-neutral-50',
    active && 'bg-neutral-50'
  )
  const bubbleClassName = cn(
    'w-5 h-5 rounded-lg bg-slate-100 shadow-sm ring-offset-2 ring-current',
    !active && `hover:ring-1`,
    active && `ring-1`
  )

  const handleClick = useCallback(() => {
    if (onColorChange) {
      onColorChange(color || '')
    }
  }, [onColorChange, color])

  return (
    <button onClick={handleClick} className={wrapperClassName}>
      <div style={{ backgroundColor: color, color: color }} className={bubbleClassName}></div>
    </button>
  )
})

ColorButton.displayName = 'ColorButton'
