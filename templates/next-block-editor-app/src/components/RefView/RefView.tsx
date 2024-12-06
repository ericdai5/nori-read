import { cn } from '@/lib/utils'
import { memo, useCallback, useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'
import { findTableNodeByUid } from '@/lib/utils/findTable'
import { MentionSuggestion } from '@/extensions/CustomMention/suggestion'
import { generateHTML } from '@tiptap/core'
import { Table } from '@/extensions/Table'
import { TableCell } from '@/extensions/Table'
import { TableRow } from '@/extensions/Table'
import { TableHeader } from '@/extensions/Table'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Button } from '../ui/Button'
import { Icon } from '@/components/ui/Icon'

interface RefViewProps {
  editor: Editor
  refData: { id: string; label: string; tableUid: string; sentence: string }
  isOpen?: boolean
  onClose: () => void
}

type TableNode = {
  type: string
  attrs: Record<string, any>
  content: TableNode[]
}

function findTable(nodes: TableNode[], uid: string): TableNode | null {
  for (const node of nodes) {
    if (node.type === 'table' && node.attrs && node.attrs.id === uid) {
      return node
    }
    if (node.content && Array.isArray(node.content)) {
      const result: TableNode | null = findTable(node.content, uid)
      if (result) {
        return result
      }
    }
  }
  return null
}

export const RefView = memo(({ editor, isOpen, onClose, refData }: RefViewProps) => {
  const { id: id, label: label, tableUid: tableUid, sentence: sentence } = refData
  const [content, setContent] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const refViewWidth = 640

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isOpen || !tableUid || !mounted || !editor.view) return

    const updateContent = () => {
      try {
        const json = editor.getJSON()
        if (!json.content) return
        const table = findTable(json.content as TableNode[], tableUid)
        if (!table) return

        const html = generateHTML({ type: 'doc', content: [table] }, [
          Document,
          Paragraph,
          Text,
          Table,
          TableCell,
          TableRow,
          TableHeader,
        ])
        setContent(html)
      } catch (error) {
        console.error('Error updating content:', error)
      }
    }

    editor.on('update', updateContent)
    updateContent() // Initial render

    return () => {
      editor.off('update', updateContent)
    }
  }, [editor, isOpen, tableUid, mounted])

  const handlePotentialClose = useCallback(() => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }, [onClose])

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
        <div className="w-full h-full">{/* This div pushes the content */}</div>
      </div>
      <div className={windowClassName}>
        <div className="w-full h-full overflow-hidden ">
          <div className="w-full h-full overflow-auto">
            {content ? (
              <div className="flex flex-col w-auto h-full">
                {/* Table area */}
                <div className="flex h-full w-full flex-1 p-6 justify-left border-b border-b-neutral-200 dark:border-b-neutral-800">
                  <div className="flex max-w-[42rem] justify-center">
                    <div className="ProseMirror external-content" dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
                </div>
                {/* Sentence area */}
                <div className="p-6 flex h-[200px] max-w-[42rem] font-serif text-lg text-black whitespace-normal">
                  {sentence}
                  {/* Button area */}
                  <Button
                    variant="ghost"
                    buttonSize="icon"
                    className="font-sans border p-0 border-neutral-200 absolute bottom-6 right-6 "
                  >
                    <Icon name="Sparkles" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
})

RefView.displayName = 'Reference View'
