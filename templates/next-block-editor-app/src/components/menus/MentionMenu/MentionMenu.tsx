import React, { useCallback, useState, useEffect } from 'react'
import { BubbleMenu as BaseBubbleMenu, useEditorState } from '@tiptap/react'
import { MenuProps } from '../types'
import { CMentionPreview } from '@/components/panels/CMentionPreview'

type MentionMenuProps = MenuProps & {
  isRefViewOpen?: boolean
  toggleRefView?: (
    data: { id: string; label: string; tableUid: string; parentId: string },
    activeRef: string | null
  ) => void
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
    if (id && label && tableUid && parentId) {
      if (isRefViewOpen) {
        console.log('MentionMenu.tsx: Starting close sequence')
        console.log('Current state:', {
          isRefViewOpen,
          id,
          storageActiveRef: editor.storage.refHighlight?.activeRef,
        })

        // First update the storage
        editor.commands.updateRefHighlight(null)
        console.log('Storage update result:', {
          storageActiveRef: editor.storage.refHighlight?.activeRef,
        })

        // Then update the highlight states
        editor.commands.updateRefHighlightState()
        console.log('State update result:', {
          storageActiveRef: editor.storage.refHighlight?.activeRef,
        })

        // Finally toggle the view
        console.log('Toggling ref view to close')
        toggleRefView?.({ id, label, tableUid, parentId }, null)

        console.log('Final state after close:', {
          storageActiveRef: editor.storage.refHighlight?.activeRef,
        })
      } else {
        console.log('MentionMenu.tsx: Starting open sequence')
        console.log('Current state:', {
          isRefViewOpen,
          id,
          storageActiveRef: editor.storage.refHighlight?.activeRef,
        })

        // First update the storage
        editor.commands.updateRefHighlight(id)
        console.log('Storage update result:', {
          storageActiveRef: editor.storage.refHighlight?.activeRef,
        })

        // Then update the highlight states
        editor.commands.updateRefHighlightState()
        console.log('State update result:', {
          storageActiveRef: editor.storage.refHighlight?.activeRef,
        })

        // Finally toggle the view
        console.log('Toggling ref view to open')
        toggleRefView?.({ id, label, tableUid, parentId }, id)

        console.log('Final state after open:', {
          storageActiveRef: editor.storage.refHighlight?.activeRef,
        })
      }
    }
  }, [id, label, tableUid, parentId, editor, isRefViewOpen, toggleRefView])

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
