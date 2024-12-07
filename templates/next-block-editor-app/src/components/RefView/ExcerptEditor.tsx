import { Editor } from '@tiptap/react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { useEffect } from 'react'
import { findNodeById } from '@/lib/utils/findNodeById'
import { CustomMention } from '@/extensions/CustomMention'
import { Transaction } from 'prosemirror-state'

interface ExcerptEditorProps {
  mainEditor: Editor
  parentId: string
  mounted: boolean
  isOpen?: boolean
}

export const ExcerptEditor = ({ mainEditor, parentId, mounted, isOpen }: ExcerptEditorProps) => {
  const excerptEditor = useEditor({
    extensions: [Document, Paragraph, Text, CustomMention],
    editable: true,
    editorProps: {
      attributes: {
        class: 'external-content excerpt-content',
      },
    },
    content: '',
    immediatelyRender: false,
  })

  useEffect(() => {
    return () => {
      if (excerptEditor) {
        excerptEditor.destroy()
      }
    }
  }, [excerptEditor])

  useEffect(() => {
    if (!excerptEditor || !isOpen || !mounted || !mainEditor?.view) {
      return
    }

    const syncContent = () => {
      try {
        console.log('Syncing content, parentId:', parentId)
        console.log('Main editor content:', mainEditor.getJSON())

        const excerpt = findNodeById(mainEditor, parentId)
        console.log('Found excerpt:', excerpt)

        if (excerpt) {
          const nodeJson = excerpt.node.toJSON()
          console.log('Node JSON:', nodeJson)

          excerptEditor.commands.setContent({
            type: 'doc',
            content: [nodeJson],
          })

          // Force a refresh of the view
          excerptEditor.view.updateState(excerptEditor.view.state)
        } else {
          console.warn('No excerpt found with ID:', parentId)
        }
      } catch (error) {
        console.error('Error syncing excerpt content:', error)
      }
    }

    // Initial sync
    syncContent()

    // Add a small delay to ensure the editor is ready
    const timeoutId = setTimeout(syncContent, 100)

    // Listen for updates
    mainEditor.on('update', syncContent)

    return () => {
      mainEditor.off('update', syncContent)
      clearTimeout(timeoutId)
    }
  }, [excerptEditor, mainEditor, parentId, isOpen, mounted])

  useEffect(() => {
    if (!excerptEditor || !mainEditor || !isOpen) {
      return
    }

    const handleExcerptUpdate = (props: { editor: Editor; transaction: Transaction }) => {
      if (!mainEditor.view || !props.transaction.docChanged) return

      try {
        const json = props.editor.getJSON()
        if (!json.content?.[0]) return

        const updatedExcerpt = json.content[0]
        const excerpt = findNodeById(mainEditor, parentId)
        if (!excerpt) return

        // Get current selection state
        const selection = excerptEditor.state.selection
        const wasAtEnd =
          selection.$anchor.pos === selection.$head.pos &&
          selection.$anchor.pos === excerptEditor.state.doc.content.size

        // Create and dispatch the transaction immediately
        const { tr } = mainEditor.state
        const pos = excerpt.pos
        const node = mainEditor.schema.nodeFromJSON({
          ...updatedExcerpt,
          attrs: {
            ...updatedExcerpt.attrs,
            id: parentId,
          },
        })

        // Apply the transaction immediately
        mainEditor.view.dispatch(tr.replaceWith(pos, pos + excerpt.node.nodeSize, node))

        // Restore selection based on context
        if (wasAtEnd) {
          // If cursor was at end, keep it at end
          excerptEditor.commands.setTextSelection(excerptEditor.state.doc.content.size)
        } else {
          // Otherwise maintain relative position
          excerptEditor.commands.setTextSelection(selection.$anchor.pos)
        }
      } catch (error) {
        console.error('Error updating main editor:', error)
      }
    }

    // Only listen for content updates
    excerptEditor.on('update', handleExcerptUpdate)

    return () => {
      excerptEditor.off('update', handleExcerptUpdate)
    }
  }, [excerptEditor, mainEditor, parentId, isOpen])

  if (!excerptEditor?.view || !isOpen) return null

  return (
    <div className="flex flex-col w-full h-full px-6">
      <EditorContent className="py-6" editor={excerptEditor} />
      <div className="min-h-[56px]"></div>
    </div>
  )
}
