import { cn } from '@/lib/utils'
import { memo, useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '../ui/Button'
import { Icon } from '@/components/ui/Icon'
import { TableEditor } from './TableEditor'
import { ExcerptEditor } from './ExcerptEditor'
import { TiptapCollabProvider, WebSocketStatus } from '@hocuspocus/provider'
import type { Doc as YDoc } from 'yjs'
import { Ai } from '@/extensions/Ai'
import { AiImage, AiWriter } from '@/extensions'
import type { EditorUser } from '@/components/BlockEditor/types'
import { userColors, userNames } from '@/lib/constants'

interface RefViewProps {
  editor: Editor
  refData: { id: string; label: string; tableUid: string; parentId: string }
  isOpen?: boolean
  onClose: () => void
  aiToken?: string
  ydoc: YDoc | null
  provider?: TiptapCollabProvider | null
}

export const RefView = memo(
  ({ editor: mainEditor, isOpen, onClose, refData, aiToken, ydoc, provider }: RefViewProps) => {
    const { id, label, tableUid, parentId } = refData
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
            <div className="flex h-full w-full flex-1 p-6 justify-center border-b border-b-neutral-200 dark:border-b-neutral-800">
              <TableEditor
                activeRef={id}
                mainEditor={mainEditor}
                tableUid={tableUid}
                mounted={mounted}
                isOpen={isOpen}
                aiToken={aiToken}
                ydoc={ydoc}
                provider={provider}
              />
            </div>
            <div className="relative flex h-[240px] max-w-[42rem]">
              <div className="z-10 fixed bottom-[216px] w-[42rem] h-6 bg-gradient-to-b from-white via-white via-50% to-transparent"></div>
              <div className="w-full overflow-y-auto">
                <ExcerptEditor
                  activeRef={id}
                  mainEditor={mainEditor}
                  parentId={parentId}
                  mounted={mounted}
                  isOpen={isOpen}
                  aiToken={aiToken}
                  ydoc={ydoc}
                  provider={provider}
                />
              </div>
              <Button
                variant="ghost"
                buttonSize="icon"
                className="z-50 fixed font-sans border p-0 bg-white border-neutral-200 bottom-6 right-6"
              >
                <Icon name="Sparkles" />
              </Button>
              <div className="z-10 fixed bottom-0 w-[42rem] h-14 bg-gradient-to-b from-transparent via-white via-50% to-white"></div>
            </div>
          </div>
        </div>
      </>
    )
  }
)

RefView.displayName = 'Reference View'
