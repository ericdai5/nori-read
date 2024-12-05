import TiptapTable from '@tiptap/extension-table'

export const Table = TiptapTable.extend({
  addAttributes() {
    return {
      ...this.parent?.(), // Keep existing table attributes
      uid: {
        default: null,
        parseHTML: element => element.getAttribute('data-table-uid'),
        renderHTML: attributes => {
          return {
            'data-reference-id': attributes.id,
          }
        },
      },
      name: {
        default: 'Table',
        parseHTML: element => element.getAttribute('data-table-name'),
        renderHTML: attributes => {
          return {
            'data-table-name': attributes.name,
          }
        },
      },
      refs: {
        default: [],
        parseHTML: element => element.getAttribute('data-table-refs'),
        renderHTML: attributes => {
          return {
            'data-table-refs': attributes.refs,
          }
        },
      },
    }
  },

  // Keep your existing configuration
  addOptions() {
    return {
      ...this.parent?.(),
      resizable: true,
      lastColumnResizable: true,
      cellMinWidth: 20,
      handleWidth: 4,
    }
  },
})

export default Table
