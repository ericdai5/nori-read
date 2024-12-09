import { mergeAttributes, Node } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { getCellsInColumn, isRowSelected, selectRow, getCellsInTable } from './utils'

// Add command type declaration
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCell: {
      /**
       * Update background colors of multiple table cells
       */
      updateCellColors: (updates: { id: string; color: string }[]) => ReturnType
    }
  }
}

export interface TableCellOptions {
  HTMLAttributes: Record<string, any>
}

export const TableCell = Node.create<TableCellOptions>({
  name: 'tableCell',

  content: 'block+',

  tableRole: 'cell',

  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [{ tag: 'td' }]
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(
      this.options.HTMLAttributes,
      HTMLAttributes,
      HTMLAttributes.backgroundColor
        ? {
            'data-background-color': HTMLAttributes.backgroundColor,
            style: `background-color: ${HTMLAttributes.backgroundColor}`,
          }
        : {}
    )
    return ['td', attrs, 0]
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => {
          const backgroundColor = element.getAttribute('data-background-color')
          return backgroundColor
        },
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {}
          }
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          }
        },
      },
      colspan: {
        default: 1,
        parseHTML: element => {
          const colspan = element.getAttribute('colspan')
          const value = colspan ? parseInt(colspan, 10) : 1

          return value
        },
      },
      rowspan: {
        default: 1,
        parseHTML: element => {
          const rowspan = element.getAttribute('rowspan')
          const value = rowspan ? parseInt(rowspan, 10) : 1

          return value
        },
      },
      colwidth: {
        default: null,
        parseHTML: element => {
          const colwidth = element.getAttribute('colwidth')
          const value = colwidth ? [parseInt(colwidth, 10)] : null

          return value
        },
      },
      style: {
        default: null,
      },
    }
  },

  addCommands() {
    return {
      updateCellColors:
        updates =>
        ({ tr, state, dispatch }) => {
          if (!dispatch) return false

          const updateMap = new Map(updates.map(update => [update.id, update.color]))
          const cells = getCellsInTable(state.selection)
          if (!cells) return false

          let hasChanges = false

          cells.forEach(({ node, pos }) => {
            const cellId = node?.attrs.id
            if (cellId && updateMap.has(cellId)) {
              const newColor = updateMap.get(cellId)

              // Only update if color is different
              if (newColor !== node.attrs.backgroundColor) {
                tr.setNodeAttribute(pos, 'backgroundColor', newColor)
                hasChanges = true
              }
            }
          })

          if (!hasChanges) return false

          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const { isEditable } = this.editor

    return [
      new Plugin({
        props: {
          decorations: state => {
            if (!isEditable) {
              return DecorationSet.empty
            }

            const { doc, selection } = state
            const decorations: Decoration[] = []
            const cells = getCellsInColumn(0)(selection)

            if (cells) {
              cells.forEach(({ pos }: { pos: number }, index: number) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const rowSelected = isRowSelected(index)(selection)
                    let className = 'grip-row'

                    if (rowSelected) {
                      className += ' selected'
                    }

                    if (index === 0) {
                      className += ' first'
                    }

                    if (index === cells.length - 1) {
                      className += ' last'
                    }

                    const grip = document.createElement('a')

                    grip.className = className
                    grip.addEventListener('mousedown', event => {
                      event.preventDefault()
                      event.stopImmediatePropagation()

                      this.editor.view.dispatch(selectRow(index)(this.editor.state.tr))
                    })

                    return grip
                  })
                )
              })
            }

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
