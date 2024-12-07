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
        const table = findTableNodeById(mainEditor.state.doc, tableUid)
        if (table) {
          tableEditor.commands.setContent({
            type: 'doc',
            content: [table.toJSON()],
          })
        }
      } catch (error) {
        console.error('Error syncing content:', error)
      }
    }

    syncContent()
    mainEditor.on('update', syncContent)

    return () => {
      mainEditor.off('update', syncContent)
    }
  }, [tableEditor, mainEditor, tableUid, isOpen, mounted])

  useEffect(() => {
    if (!tableEditor || !mainEditor || !isOpen) {
      return
    }

    const handleTableUpdate = (props: { editor: Editor; transaction: Transaction }) => {
      if (!mainEditor.view) return

      try {
        const json = props.editor.getJSON()
        if (!json.content?.[0]) return

        const updatedTable = json.content[0]
        const table = findTableNodeById(mainEditor.state.doc, tableUid)
        if (!table) return

        const mainEditorJson = mainEditor.getJSON()
        if (!mainEditorJson.content) return

        const updatedContent = mainEditorJson.content.map((node: any) => {
          if (node.type === 'table' && node.attrs?.id === tableUid) {
            return {
              ...updatedTable,
              attrs: {
                ...updatedTable.attrs,
                id: tableUid,
              },
            }
          }
          return node
        })

        mainEditor.commands.setContent({
          type: 'doc',
          content: updatedContent,
        })
      } catch (error) {
        console.error('Error updating main editor:', error)
      }
    }

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
      <div className="flex w-full justify-center items-cente">
        <EditorContent editor={tableEditor} />
      </div>
    </div>
  )
}
