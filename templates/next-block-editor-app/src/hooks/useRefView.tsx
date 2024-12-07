import { useCallback, useMemo, useState } from 'react'

type RefData = {
  id: string
  label: string
  tableUid: string
  parentId: string
}

export type RefViewState = {
  isOpen: boolean
  refData: RefData
  toggle: (data: RefData) => void
  close: () => void
  open: () => void
}

export const useRefView = (): RefViewState => {
  const [isOpen, setIsOpen] = useState(false)
  const [refData, setRefData] = useState<RefData>({ id: '', label: '', tableUid: '', parentId: '' })

  return useMemo(() => {
    return {
      isOpen,
      refData,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: (data: RefData) => {
        setRefData(data)
        setIsOpen(prev => !prev)
      },
    }
  }, [isOpen, refData])
}
