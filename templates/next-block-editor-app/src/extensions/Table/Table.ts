import TiptapTable from '@tiptap/extension-table'

export const Table = TiptapTable.extend({
  addAttributes() {
    return {
      ...this.parent?.(), // Keep existing table attributes
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          return {
            'data-id': attributes.id,
          }
        },
      },
      name: {
        default: 'Table',
        parseHTML: element => element.getAttribute('data-name'),
        renderHTML: attributes => {
          return {
            'data-name': attributes.name,
          }
        },
      },
      refs: {
        default: [],
        parseHTML: element => element.getAttribute('data-refs'),
        renderHTML: attributes => {
          return {
            'data-refs': attributes.refs,
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
