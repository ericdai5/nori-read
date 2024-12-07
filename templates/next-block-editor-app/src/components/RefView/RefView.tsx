import { cn } from '@/lib/utils'
import { memo, useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '../ui/Button'
import { Icon } from '@/components/ui/Icon'
import { TableEditor } from './TableEditor'

interface RefViewProps {
  editor: Editor
  refData: { id: string; label: string; tableUid: string; sentence: string }
  isOpen?: boolean
  onClose: () => void
}

export const RefView = memo(({ editor: mainEditor, isOpen, onClose, refData }: RefViewProps) => {
  const { id, label, tableUid, sentence } = refData
  const [mounted, setMounted] = useState(false)
  const refViewWidth = 640

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const windowClassName = cn(
    'h-full fixed top-0 right-0 bg-white z-[999]',
    'dark:bg-black',
    'w-[640px] transition-all duration-300 ease-in-out',
    !isOpen && 'translate-x-full opacity-0',
    isOpen && 'translate-x-0 opacity-100 border-l border-l-neutral-150 dark:border-r-neutral-850'
  )

  if (!mounted) return null

  return (
    <>
      <div
        className="fixed inset-0 transition-all duration-300 ease-in-out"
        style={{
          paddingRight: isOpen ? `${refViewWidth}px` : '0',
          pointerEvents: 'none',
        }}
      >
        <div className="w-full h-full" />
      </div>
      <div className={windowClassName}>
        <div className="flex flex-col w-auto h-full">
          <div className="flex h-full w-full flex-1 p-6 justify-center border-b bg-red-500 border-b-neutral-200 dark:border-b-neutral-800">
            <TableEditor mainEditor={mainEditor} tableUid={tableUid} mounted={mounted} isOpen={isOpen} />
          </div>
          <div className="p-6 flex h-[240px] max-w-[42rem] font-serif text-lg text-black whitespace-normal">
            {sentence}
            <Button
              variant="ghost"
              buttonSize="icon"
              className="font-sans border p-0 border-neutral-200 absolute bottom-6 right-6 "
            >
              <Icon name="Sparkles" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
})

RefView.displayName = 'Reference View'
