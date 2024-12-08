import { useEffect, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import type { AnyExtension, Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { TiptapCollabProvider, WebSocketStatus } from '@hocuspocus/provider'
import type { Doc as YDoc } from 'yjs'
import { suggestion } from '@/extensions/CustomMention/suggestion'
import { ExtensionKit } from '@/extensions/extension-kit'
import { userColors, userNames } from '@/lib/constants'
import { randomElement } from '@/lib/utils'
import type { EditorUser } from '@/components/BlockEditor/types'
import { Ai } from '@/extensions/Ai'
import { AiImage, AiWriter } from '@/extensions'
import { Reference } from '@/extensions/Reference'
import { TableFigure } from '@/extensions/TableFigure'
import { CustomMention } from '@/extensions/CustomMention'
import { findNodeById } from '@/lib/utils/findNodeById'
import { Transaction } from 'prosemirror-state'
import { TextMenu } from '../menus/TextMenu/TextMenu'
import { RefHighlight } from '@/extensions/RefHighlight'

interface ExcerptEditorProps {
  activeRef: string | null
  mainEditor: Editor
  parentId: string
  mounted: boolean
  isOpen?: boolean
}

export const ExcerptEditor = ({
  activeRef,
  mainEditor,
  parentId,
  mounted,
  isOpen,
  aiToken,
  ydoc,
  provider,
  userId,
  userName = 'Maxi',
}: ExcerptEditorProps & {
  aiToken?: string
  ydoc: YDoc | null
  provider?: TiptapCollabProvider | null | undefined
  userId?: string
  userName?: string
}) => {
  const [collabState, setCollabState] = useState<WebSocketStatus>(
    provider ? WebSocketStatus.Connecting : WebSocketStatus.Disconnected
  )

  const excerptEditor = useEditor({
    extensions: [
      ...ExtensionKit({
        provider,
      }),
      Reference,
      RefHighlight.configure({
        multicolor: true,
      }),
      CustomMention.configure({
        HTMLAttributes: {
          class:
            'inline-flex items-center px-2 py-1 mx-1 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 reference-citation font-sans text-neutral-500 hover:text-neutral-700 dark:text-neutral-200 dark:hover:text-neutral-300 transition-transform hover:scale-105',
        },
        suggestion,
        renderHTML({ node }) {
          return `${node.attrs.label}`
        },
      }),
      provider && ydoc
        ? Collaboration.configure({
            document: ydoc,
          })
        : undefined,
      provider
        ? CollaborationCursor.configure({
            provider,
            user: {
              name: randomElement(userNames),
              color: randomElement(userColors),
            },
          })
        : undefined,
      aiToken
        ? AiWriter.configure({
            authorId: userId,
            authorName: userName,
          })
        : undefined,
      aiToken
        ? AiImage.configure({
            authorId: userId,
            authorName: userName,
          })
        : undefined,
      aiToken ? Ai.configure({ token: aiToken }) : undefined,
    ].filter((e): e is AnyExtension => e !== undefined),
    editorProps: {
      attributes: {
        type: 'excerpt',
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'external-content excerpt-content',
      },
    },
    editable: true,
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
      <TextMenu editor={excerptEditor} activeRef={activeRef} />
      <EditorContent className="py-6" editor={excerptEditor} />
      <div className="min-h-[56px]"></div>
    </div>
  )
}
