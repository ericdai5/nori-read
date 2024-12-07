import React, { useCallback, useState, useEffect } from 'react'
import { BubbleMenu as BaseBubbleMenu, useEditorState } from '@tiptap/react'

import { MenuProps } from '../types'
import { CMentionPreview } from '@/components/panels/CMentionPreview'

type MentionMenuProps = MenuProps & {
  isRefViewOpen?: boolean
  toggleRefView?: (data: { id: string; label: string; tableUid: string; parentId: string }) => void
}

export const MentionMenu = ({ editor, appendTo, isRefViewOpen, toggleRefView }: MentionMenuProps): JSX.Element => {
  const { id, label, tableUid, parentId } = useEditorState({
    editor,
    selector: ctx => {
      const attrs = ctx.editor.getAttributes('custom-mention')
      return { id: attrs.id, label: attrs.label, tableUid: attrs.tableUid, parentId: attrs.parentId }
    },
  })

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive('custom-mention')
    return isActive
  }, [editor])

  const handleView = useCallback(() => {
    console.log('handleView called with:', { id, label, tableUid, parentId })
    if (id && label && tableUid && parentId) {
      console.log('Executing toggleRefView with:', { id, label, tableUid, parentId })
      toggleRefView?.({ id, label, tableUid, parentId })
    }
  }, [toggleRefView, id, label, tableUid, parentId])

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="mentionMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        popperOptions: {
          modifiers: [{ name: 'flip', enabled: false }],
        },
        appendTo: () => {
          return appendTo?.current
        },
      }}
    >
      <CMentionPreview isRefViewOpen={isRefViewOpen} toggleRefView={handleView} />
    </BaseBubbleMenu>
  )
}

export default MentionMenu
