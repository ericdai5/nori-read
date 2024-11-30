import TiptapTable from '@tiptap/extension-table'

export const Table = TiptapTable.configure({
  resizable: true,
  lastColumnResizable: true,
  cellMinWidth: 20,
  handleWidth: 4,
})

export default Table
