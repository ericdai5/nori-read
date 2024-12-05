import { cn } from '@/lib/utils'
import { memo, useCallback, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { findTableNodeByUid } from '@/lib/utils/findTable'

interface RefViewProps {
  editor: Editor
  refData: { id?: string; label?: string; tableUid?: string; sentence?: string }
  isOpen?: boolean
  onClose: () => void
}

export const RefView = memo(({ editor, isOpen, onClose, refData }: RefViewProps) => {
  const { tableUid } = refData

  const handlePotentialClose = useCallback(() => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }, [onClose])

  const renderTable = useCallback(
    (uid: string) => {
      if (!uid) return null

      const tableNode = findTableNodeByUid(editor.state.doc, uid)
      if (!tableNode) return null

      // Find the table element by its reference ID
      const tableElement = editor.view.dom.querySelector(`[data-table-uid="${uid}"]`)
      if (!tableElement) return null

      return (
        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: tableElement.outerHTML }} />
        </div>
      )
    },
    [editor]
  )

  const windowClassName = cn(
    'absolute top-0 right-0 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full lg:h-auto lg:relative z-[999] w-0 duration-300 transition-all',
    'dark:bg-black lg:dark:bg-black/30',
    !isOpen && 'border-r-transparent',
    isOpen && 'w-[40vw] border-r border-r-neutral-200 dark:border-r-neutral-800'
  )

  return (
    <div className={windowClassName}>
      <div className="w-full h-full overflow-hidden">
        <div className="w-full h-full p-6 overflow-auto">
          {isOpen && tableUid ? renderTable(tableUid) : <div className="text-gray-500">No reference selected</div>}
        </div>
      </div>
    </div>
  )
})

RefView.displayName = 'Reference View'
