import React, { useCallback, useState, useEffect } from 'react'
import { BubbleMenu as BaseBubbleMenu, useEditorState } from '@tiptap/react'

import { MenuProps } from '../types'
import { CMentionPreview } from '@/components/panels/CMentionPreview'

type MentionMenuProps = MenuProps & {
  isRefViewOpen?: boolean
  toggleRefView?: (data: { id: string; label: string; tableUid: string; sentence: string }) => void
}

export const MentionMenu = ({ editor, appendTo, isRefViewOpen, toggleRefView }: MentionMenuProps): JSX.Element => {
  const { id, label, tableUid, sentence } = useEditorState({
    editor,
    selector: ctx => {
      const attrs = ctx.editor.getAttributes('custom-mention')
      return { id: attrs.id, label: attrs.label, tableUid: attrs.tableUid, sentence: attrs.sentence }
    },
  })

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive('custom-mention')
    return isActive
  }, [editor])

  const handleView = useCallback(() => {
    console.log('handleView called with:', { id, label, tableUid, sentence })
    if (id && label && tableUid && sentence) {
      console.log('Executing toggleRefView with:', { id, label, tableUid, sentence })
      toggleRefView?.({ id, label, tableUid, sentence })
    }
  }, [toggleRefView, id, label, tableUid, sentence])

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
