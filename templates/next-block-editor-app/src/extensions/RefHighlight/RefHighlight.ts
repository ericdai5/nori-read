import { Highlight } from '@tiptap/extension-highlight'
import { findParentNode } from '@tiptap/core'
import { CellSelection, TableMap } from '@tiptap/pm/tables'
import { Editor } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    refHighlight: {
      setRefHighlight: (attributes?: { color: string }) => ReturnType
      unsetRefHighlight: () => ReturnType
    }
  }
}

export const RefHighlight = Highlight.extend({
  name: 'refHighlight',

  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-background-color'),
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
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setRefHighlight:
        attributes =>
        ({ chain }) => {
          // Handle both table cells and regular text
          return chain()
            .command(({ tr, state, dispatch }) => {
              const { selection } = state

              // Handle table cell selection
              if (selection instanceof CellSelection) {
                if (!dispatch) return true

                const table = findParentNode(node => node.type.name === 'table')(selection)
                if (!table) return false

                const tableMap = TableMap.get(table.node)
                const start = table.start

                // Get the rectangle of selected cells
                const cellsInRect = tableMap.cellsInRect(
                  tableMap.rectBetween(selection.$anchorCell.pos - start, selection.$headCell.pos - start)
                )

                // Update each selected cell
                cellsInRect.forEach(cellPos => {
                  const node = table.node.nodeAt(cellPos)
                  if (node) {
                    tr.setNodeMarkup(start + cellPos, null, {
                      ...node.attrs,
                      backgroundColor: attributes?.color,
                    })
                  }
                })

                return true
              }

              // Default highlight behavior for regular text
              return false
            })
            .setHighlight(attributes)
            .run()
        },

      unsetRefHighlight:
        () =>
        ({ chain }) => {
          return chain()
            .command(({ tr, state, dispatch }) => {
              const { selection } = state

              // Handle table cell selection
              if (selection instanceof CellSelection) {
                if (!dispatch) return true

                const table = findParentNode(node => node.type.name === 'table')(selection)
                if (!table) return false

                const tableMap = TableMap.get(table.node)
                const start = table.start

                // Get the rectangle of selected cells
                const cellsInRect = tableMap.cellsInRect(
                  tableMap.rectBetween(selection.$anchorCell.pos - start, selection.$headCell.pos - start)
                )

                // Update each selected cell
                cellsInRect.forEach(cellPos => {
                  const node = table.node.nodeAt(cellPos)
                  if (node) {
                    tr.setNodeMarkup(start + cellPos, null, {
                      ...node.attrs,
                      backgroundColor: null,
                    })
                  }
                })

                return true
              }

              // Default behavior for regular text
              return false
            })
            .unsetHighlight()
            .run()
        },
    }
  },
})
