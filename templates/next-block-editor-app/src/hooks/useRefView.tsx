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
  toggle: (data: RefData, activeRef: string | null) => void
  activeRef: string | null
}

export const useRefView = (): RefViewState => {
  const [isOpen, setIsOpen] = useState(false)
  const [refData, setRefData] = useState<RefData>({ id: '', label: '', tableUid: '', parentId: '' })
  const [activeRef, setActiveRef] = useState<string | null>(null)

  const toggle = useCallback(
    (data: RefData, activeRef: string | null) => {
      console.log('Toggling RefView with id:', data.id, 'activeRef:', activeRef)
      // If we're opening the ref view, set the active ref first
      if (!isOpen) {
        setActiveRef(activeRef)
        setRefData(data)
        setIsOpen(true)
      } else if (isOpen && data.id == activeRef) {
        // If the ref view is closed and we're opening a new ref, open the ref view
        setActiveRef('')
        setIsOpen(false)
        setRefData({ id: '', label: '', tableUid: '', parentId: '' })
      } else if (isOpen && data.id !== activeRef) {
        setActiveRef(activeRef)
        setRefData(data)
        setIsOpen(true)
      }
    },
    [isOpen, activeRef, refData]
  )

  return useMemo(() => {
    return {
      isOpen,
      refData,
      activeRef,
      toggle,
    }
  }, [isOpen, refData, activeRef, toggle])
}
