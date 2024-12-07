import { Editor } from '@tiptap/react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Table } from '@/extensions/Table'
import { TableCell } from '@/extensions/Table'
import { TableRow } from '@/extensions/Table'
import { TableHeader } from '@/extensions/Table'
import { findTableNodeById } from '@/lib/utils/findTable'
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus'
import { useRef, useEffect } from 'react'
import { Transaction } from 'prosemirror-state'

interface TableEditorProps {
  mainEditor: Editor
  tableUid: string
  mounted: boolean
  isOpen?: boolean
}

export const TableEditor = ({ mainEditor, tableUid, mounted, isOpen }: TableEditorProps) => {
  const menuContainerRef = useRef<HTMLDivElement>(null)

  const tableEditor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Table.configure({
        resizable: true,
        lastColumnResizable: true,
        cellMinWidth: 20,
        handleWidth: 4,
      }),
      TableCell,
      TableRow,
      TableHeader,
    ],
    editable: true,
    editorProps: {
      attributes: {
        class: 'external-content',
      },
    },
    content: '',
    immediatelyRender: false,
  })

  useEffect(() => {
    return () => {
      if (tableEditor) {
        tableEditor.destroy()
      }
    }
  }, [tableEditor])

  useEffect(() => {
    if (!tableEditor || !isOpen || !mounted || !mainEditor?.view) {
      return
    }

    const syncContent = () => {
      try {
        console.log('Syncing table content, tableUid:', tableUid)
        console.log('Main editor content:', mainEditor.getJSON())

        const table = findTableNodeById(mainEditor.state.doc, tableUid)
        console.log('Found table:', table)

        if (table) {
          const nodeJson = table.node.toJSON()
          console.log('Table JSON:', nodeJson)

          tableEditor.commands.setContent({
            type: 'doc',
            content: [nodeJson],
          })

          // Force a refresh of the view
          tableEditor.view.updateState(tableEditor.view.state)
        } else {
          console.warn('No table found with ID:', tableUid)
        }
      } catch (error) {
        console.error('Error syncing table content:', error)
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

  if (!tableEditor?.view || !isOpen) return null

  return (
    <div className="flex w-full h-full overflow-hidden justify-center items-center" ref={menuContainerRef}>
      <TableColumnMenu editor={tableEditor} appendTo={menuContainerRef} />
      <TableRowMenu editor={tableEditor} appendTo={menuContainerRef} />
      <div className="flex w-full justify-center items-center">
        <EditorContent editor={tableEditor} />
      </div>
    </div>
  )
}
