import { AnyExtension, Editor } from '@tiptap/react'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Table } from '@/extensions/Table'
import { TableCell } from '@/extensions/Table'
import { TableRow } from '@/extensions/Table'
import { TableHeader } from '@/extensions/Table'
import { findTableNodeById } from '@/lib/utils/findTable'
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Transaction } from 'prosemirror-state'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
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
import { TableFigure } from '@/extensions/TableFigure'
import { CustomMention } from '@/extensions/CustomMention'
import { findNodeById } from '@/lib/utils/findNodeById'
import { TextMenu } from '../menus/TextMenu/TextMenu'
import { Node } from '@tiptap/core'
import { RefHighlight } from '@/extensions/RefHighlight'
import { Button } from '../ui/Button'
import { Icon } from '@/components/ui/Icon'
import { analyzeTableAndHighlights } from '@/lib/utils/chatgpt'

interface TableEditorProps {
  activeRef: string | null
  mainEditor: Editor
  tableUid: string
  mounted: boolean
  isOpen?: boolean
}

const TableDocument = Document.extend({
  content: 'table',
}).configure({
  content: 'table',
})

interface ColorUpdate {
  id: string
  color: string
}

interface TableNode {
  attrs: {
    id: string
    name: string
    refs: any[]
  }
  content?: Array<{
    attrs: {
      id: string
    }
    content?: Array<{
      attrs: {
        id: string
      }
      content: any
    }>
  }>
}

interface HighlightInfo {
  text: string
  color: string
}

export const TableEditor = ({
  activeRef,
  mainEditor,
  tableUid,
  mounted,
  isOpen,
  aiToken,
  ydoc,
  provider,
  userId,
  userName = 'Maxi',
}: TableEditorProps & {
  aiToken?: string
  ydoc: YDoc | null
  provider?: TiptapCollabProvider | null | undefined
  userId?: string
  userName?: string
}) => {
  const [collabState, setCollabState] = useState<WebSocketStatus>(
    provider ? WebSocketStatus.Connecting : WebSocketStatus.Disconnected
  )

  const menuContainerRef = useRef<HTMLDivElement>(null)

  const tableEditor = useEditor({
    extensions: [
      TableDocument,
      Table.configure({
        resizable: true,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ...ExtensionKit({
        provider,
      }).filter(ext => ext.name !== 'doc' && !ext.name.startsWith('table')),
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
        type: 'table',
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'external-content table-content',
      },
    },
    editable: true,
    content: '',
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!tableEditor) return

    return () => {
      tableEditor.destroy()
    }
  }, [tableEditor])

  useEffect(() => {
    if (!tableEditor || !isOpen || !mounted || !mainEditor?.view) {
      return
    }

    const syncContent = () => {
      try {
        const table = findTableNodeById(mainEditor.state.doc, tableUid)
        if (table) {
          const nodeJson = table.node.toJSON()

          // Get current selection before updating content
          const wasSelected = tableEditor.view.hasFocus()
          const prevSelection = tableEditor.state.selection

          tableEditor.commands.setContent({
            type: 'doc',
            content: [nodeJson],
          })

          // Clear selection if editor wasn't focused
          if (!wasSelected) {
            tableEditor.commands.setTextSelection(0)
            tableEditor.view.dom.blur()
          }
        }
      } catch (error) {
        console.error('Error syncing table content:', error)
      }
    }

    syncContent()
    const timeoutId = setTimeout(syncContent, 100)
    mainEditor.on('update', syncContent)

    return () => {
      mainEditor.off('update', syncContent)
      clearTimeout(timeoutId)
    }
  }, [tableEditor, mainEditor, tableUid, isOpen, mounted])

  useEffect(() => {
    if (!tableEditor || !mainEditor || !isOpen) {
      return
    }

    const handleTableUpdate = (props: { editor: Editor; transaction: Transaction }) => {
      if (!mainEditor.view || !props.transaction.docChanged) return

      try {
        const json = props.editor.getJSON()
        if (!json.content?.[0]) return

        const updatedTable = json.content[0]
        const table = findTableNodeById(mainEditor.state.doc, tableUid)
        if (!table) return

        // Get current selection state
        const selection = tableEditor.state.selection

        // Create and dispatch the transaction immediately
        const { tr } = mainEditor.state
        const pos = table.pos // Position in the document
        const tableNode = table.node // The actual table node

        // Create new node with updated content and preserved ID
        const newNode = mainEditor.schema.nodeFromJSON({
          ...updatedTable,
          attrs: {
            ...updatedTable.attrs,
            id: tableUid,
          },
        })

        // Apply the transaction immediately
        mainEditor.view.dispatch(tr.replaceWith(pos, pos + tableNode.nodeSize, newNode))

        // Restore selection in table editor
        if (selection) {
          tableEditor.commands.setTextSelection(selection.from)
        }
      } catch (error) {
        console.error('Error updating main editor:', error)
      }
    }

    // Only listen for content updates
    tableEditor.on('update', handleTableUpdate)

    return () => {
      tableEditor.off('update', handleTableUpdate)
    }
  }, [tableEditor, mainEditor, tableUid, isOpen])

  const updateCellColors = useCallback(
    (updates: ColorUpdate[]) => {
      if (!tableEditor) return
      tableEditor.commands.updateCellColors(updates)
    },
    [tableEditor]
  )

  // Add new function to export table JSON
  const exportTableJSON = useCallback(() => {
    if (!mainEditor) return null
    const table = findTableNodeById(mainEditor.state.doc, tableUid)
    if (!table) {
      console.log('No table found with ID:', tableUid)
      return null
    }
    const nodeJson = table.node.toJSON() as TableNode
    // Create simplified table structure
    const simplifiedTable = {
      type: 'table',
      attrs: {
        id: nodeJson.attrs.id,
        name: nodeJson.attrs.name,
        refs: nodeJson.attrs.refs || [],
      },
      content: nodeJson.content?.map(row => ({
        type: 'tableRow',
        attrs: {
          id: row.attrs.id,
        },
        content: row.content?.map(cell => ({
          type: 'tableCell',
          attrs: {
            id: cell.attrs.id,
          },
          content: cell.content,
        })),
      })),
    }
    return simplifiedTable
  }, [mainEditor, tableUid])

  const findMatchingHighlights = useCallback((): HighlightInfo[] => {
    if (!mainEditor) return []

    const matches: HighlightInfo[] = []

    // Process all nodes in the main editor
    mainEditor.state.doc.descendants((node, pos) => {
      if (node.isText && node.marks.length > 0) {
        // Find refHighlight marks that match activeRef
        const refHighlightMarks = node.marks.filter(
          mark => mark.type.name === 'refHighlight' && mark.attrs.refId === activeRef
        )

        if (refHighlightMarks.length > 0) {
          refHighlightMarks.forEach(mark => {
            matches.push({
              text: node.text || '',
              color: mark.attrs.color || 'transparent',
            })
          })
        }
      }
    })

    return matches
  }, [mainEditor, activeRef]) // Remove tableUid since we're searching the entire document

  // useEffect(() => {
  //   if (tableEditor) {
  //     tableEditor.commands.updateRefHighlight(activeRef)
  //     tableEditor.commands.updateRefHighlightState()
  //   }
  // }, [activeRef, tableEditor])

  // Add state for showing results
  const [showResults, setShowResults] = useState(false)

  // Add handler for button click
  const handleShowResults = useCallback(async () => {
    const highlights = findMatchingHighlights()
    const tableData = exportTableJSON()

    try {
      const analysis = await analyzeTableAndHighlights(highlights, tableData)

      // Log the analysis results
      console.log('=== Table Analysis Results ===')
      console.log('AI Suggestions:', analysis.suggestions)
      console.log('Explanation:', analysis.explanation)

      // Optionally, you could automatically apply the suggested colors
      if (analysis.suggestions.length > 0) {
        const updates = analysis.suggestions
          .filter(s => s.confidence > 0.7) // Only apply high-confidence suggestions
          .map(s => ({
            id: s.cellId,
            color: s.color,
          }))

        if (updates.length > 0) {
          updateCellColors(updates)
        }
      }
    } catch (error) {
      console.error('Failed to analyze table:', error)
    }
  }, [findMatchingHighlights, exportTableJSON, updateCellColors])

  if (!tableEditor?.view || !isOpen) return null

  return (
    <div className="flex w-full h-full overflow-hidden justify-center items-center" ref={menuContainerRef}>
      <Button
        variant="ghost"
        buttonSize="icon"
        className="z-50 fixed font-sans border p-0 bg-white hover:bg-neutral-50 border-neutral-200 top-4 right-4"
        onClick={handleShowResults}
      >
        <Icon name="Sparkles" />
      </Button>
      <TextMenu editor={tableEditor} activeRef={activeRef} />
      <TableColumnMenu editor={tableEditor} appendTo={menuContainerRef} />
      <TableRowMenu editor={tableEditor} appendTo={menuContainerRef} />
      <div className="flex w-full justify-center items-center">
        <EditorContent className="flex justify-center items-center" editor={tableEditor} />
      </div>
    </div>
  )
}
