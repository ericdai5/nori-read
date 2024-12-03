import React, { useCallback, useState } from 'react'
import { BubbleMenu as BaseBubbleMenu, useEditorState } from '@tiptap/react'

import { MenuProps } from '../types'
import { RefPreviewPanel } from '@/components/panels/RefPreviewPanel'
import { RefEditorPanel } from '@/components/panels'

type RefMenuProps = MenuProps & {
  isRefViewOpen?: boolean
  toggleRefView?: () => void
}

export const RefMenu = ({ editor, appendTo, isRefViewOpen, toggleRefView }: RefMenuProps): JSX.Element => {
  const [showEdit, setShowEdit] = useState(false)
  const { id, sentence } = useEditorState({
    editor,
    selector: ctx => {
      const attrs = ctx.editor.getAttributes('reference')
      return { id: attrs.id, sentence: attrs.sentence }
    },
  })

  const shouldShow = useCallback(() => {
    return editor.isActive('reference')
  }, [editor])

  const handleEdit = useCallback(() => {
    setShowEdit(true)
  }, [])

  const handleView = useCallback(() => {
    toggleRefView?.()
  }, [toggleRefView])

  const onSetRef = useCallback(
    (refId: string, refSentence: string) => {
      editor.chain().focus().extendMarkRange('reference').setRef({ id: refId, sentence: refSentence }).run()
      setShowEdit(false)
    },
    [editor]
  )

  const onUnsetRef = useCallback(() => {
    editor.chain().focus().extendMarkRange('reference').unsetRef().run()
    setShowEdit(false)
  }, [editor])

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="refMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        popperOptions: {
          modifiers: [{ name: 'flip', enabled: false }],
        },
        appendTo: () => appendTo?.current,
        onHidden: () => setShowEdit(false),
      }}
    >
      {showEdit ? (
        <RefEditorPanel refId={id} sentence={sentence} onSetRef={onSetRef} />
      ) : (
        <RefPreviewPanel
          id={id}
          onClear={onUnsetRef}
          onEdit={handleEdit}
          isRefViewOpen={isRefViewOpen}
          toggleRefView={handleView}
        />
      )}
    </BaseBubbleMenu>
  )
}

export default RefMenu
