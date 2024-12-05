import React, { useCallback, useState, useEffect } from 'react'
import { BubbleMenu as BaseBubbleMenu, useEditorState } from '@tiptap/react'

import { MenuProps } from '../types'
import { CMentionPreview } from '@/components/panels/CMentionPreview'

type MentionMenuProps = MenuProps & {
  isRefViewOpen?: boolean
  toggleRefView?: () => void
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
    return editor.isActive('custom-mention')
  }, [editor])

  const handleView = useCallback(() => {
    toggleRefView?.()
  }, [toggleRefView])

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
      <CMentionPreview
        id={id}
        label={label}
        tableUid={tableUid}
        sentence={sentence}
        isRefViewOpen={isRefViewOpen}
        toggleRefView={handleView}
      />
    </BaseBubbleMenu>
  )
}

export default MentionMenu
