import { EditorContent } from '@tiptap/react'
import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

import { LinkMenu } from '@/components/menus'
import { RefMenu } from '@/components/menus'
import { MentionMenu } from '@/components/menus/MentionMenu'

import { useBlockEditor } from '@/hooks/useBlockEditor'

import '@/styles/index.css'

import { Sidebar } from '@/components/Sidebar'
import { RefView } from '@/components/RefView'
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu'
import { ColumnsMenu } from '@/extensions/MultiColumn/menus'
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus'
import { EditorHeader } from './components/EditorHeader'
import { TextMenu } from '../menus/TextMenu'
import { ContentItemMenu } from '../menus/ContentItemMenu'
import { useSidebar } from '@/hooks/useSidebar'
import * as Y from 'yjs'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import { RefViewState } from '@/hooks/useRefView'

export const BlockEditor = ({
  aiToken,
  ydoc,
  provider,
  refView,
  activeRef,
}: {
  aiToken?: string
  ydoc: Y.Doc | null
  provider?: TiptapCollabProvider | null | undefined
  refView: RefViewState
  activeRef: string | null
}) => {
  const menuContainerRef = useRef(null)
  const leftSidebar = useSidebar()
  const { editor, users, collabState } = useBlockEditor({ aiToken, ydoc, provider })
  // console.log('Current activeRef:', activeRef, 'refView.isOpen:', refView.isOpen, 'refView.refData:', refView.refData)

  useEffect(() => {
    if (editor) {
      console.log('BlockEditor.tsx sent update request for activeRef in refHighlight:', activeRef)
      editor.commands.updateRefHighlight(activeRef)
    }
  }, [activeRef])

  if (!editor || !users) {
    return null
  }

  return (
    <div className="flex h-full" ref={menuContainerRef}>
      <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} editor={editor} />
      <div
        className={cn(
          'relative flex flex-col flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out',
          refView.isOpen && 'mr-[640px]'
        )}
      >
        <EditorHeader
          editor={editor}
          collabState={collabState}
          users={users}
          isSidebarOpen={leftSidebar.isOpen}
          toggleSidebar={leftSidebar.toggle}
        />
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        <ContentItemMenu editor={editor} />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <RefMenu
          editor={editor}
          appendTo={menuContainerRef}
          isRefViewOpen={refView.isOpen}
          toggleRefView={() => refView.toggle({} as any)}
        />
        <MentionMenu
          editor={editor}
          appendTo={menuContainerRef}
          isRefViewOpen={refView.isOpen}
          toggleRefView={refView.toggle}
        />
        <TextMenu editor={editor} activeRef={activeRef} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
      </div>
      <RefView
        isOpen={refView.isOpen}
        onClose={refView.close}
        editor={editor}
        refData={refView.refData}
        aiToken={aiToken}
        ydoc={ydoc}
        provider={provider}
      />
    </div>
  )
}

export default BlockEditor
