import { useCallback, useMemo, useState } from 'react'

export type RefViewState = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useRefView = (): RefViewState => {
  const [isOpen, setIsOpen] = useState(false)
  return useMemo(() => {
    return {
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen(prev => !prev),
    }
  }, [isOpen])
}
