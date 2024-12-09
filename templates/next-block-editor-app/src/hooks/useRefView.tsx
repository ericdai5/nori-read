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

      if (!isOpen) {
        // Opening the ref view
        setActiveRef(activeRef)
        setRefData(data)
        setIsOpen(true)
      } else if (isOpen && activeRef === null) {
        // Explicitly closing the ref view
        setActiveRef(null)
        setIsOpen(false)
        setRefData({ id: '', label: '', tableUid: '', parentId: '' })
      } else if (isOpen && activeRef !== null) {
        // Switching to a different ref
        setActiveRef(activeRef)
        setRefData(data)
        setIsOpen(true)
      }
    },
    [isOpen]
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
