import TiptapTable from '@tiptap/extension-table'

export const Table = TiptapTable.extend({
  addAttributes() {
    return {
      ...this.parent?.(), // Keep existing table attributes
      uid: {
        default: null,
        parseHTML: element => element.getAttribute('uid'),
        renderHTML: attributes => {
          return {
            uid: attributes.uid,
          }
        },
      },
      name: {
        default: 'Table',
        parseHTML: element => element.getAttribute('name'),
        renderHTML: attributes => {
          return {
            name: attributes.name,
          }
        },
      },
      refs: {
        default: [],
        parseHTML: element => element.getAttribute('refs'),
        renderHTML: attributes => {
          return {
            refs: attributes.refs,
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
