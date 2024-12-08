import { Highlight } from '@tiptap/extension-highlight'
import { findParentNode } from '@tiptap/core'
import { CellSelection, TableMap } from '@tiptap/pm/tables'
import { Editor } from '@tiptap/core'
import { Node, Mark } from '@tiptap/pm/model'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    refHighlight: {
      setRefHighlight: (attributes?: { color: string; refId?: string | null }) => ReturnType
      unsetRefHighlight: () => ReturnType
      updateRefHighlight: (activeRef: string | null) => ReturnType
    }
  }
}

interface RefHighlightStorage {
  activeRef: string | null
}

interface RefHighlightOptions {
  multicolor: boolean
}

export const RefHighlight = Highlight.extend<RefHighlightOptions, RefHighlightStorage>({
  name: 'refHighlight',
  multicolor: true,

  addOptions() {
    return {
      ...this.parent?.(),
      multicolor: true,
    }
  },

  addStorage() {
    return {
      ...this.parent?.(),
      activeRef: null,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      refId: {
        default: null,
        parseHTML: element => element.getAttribute('data-ref-id'),
        renderHTML: attributes => ({
          'data-ref-id': attributes.refId,
        }),
      },
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-highlight-color'),
        renderHTML: attributes => {
          const isActive = this.storage.activeRef && this.storage.activeRef === attributes.refId

          console.log('isActive', isActive)
          console.log('attributes.refId', attributes.refId)
          console.log('this.storage.activeRef', this.storage.activeRef)
          console.log('attributes.color', attributes.color)

          return {
            'data-highlight-color': attributes.color,
            'data-ref-id': attributes.refId,
            class: `highlight-mark ${isActive ? 'active' : ''}`,
            style: `background-color: ${isActive ? attributes.color : 'transparent'}`,
          }
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-background-color'),
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {}
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
          // Add debug log
          console.log('setRefHighlight called with attributes:', attributes)

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
                      refId: attributes?.refId,
                    })
                  }
                })

                return true
              }

              // Default highlight behavior for regular text
              return false
            })
            .setMark(this.name, {
              color: attributes?.color,
              refId: attributes?.refId,
            })
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

      updateRefHighlight:
        (activeRef: string | null) =>
        ({ editor }) => {
          console.log('Updating activeRef to:', activeRef)
          // Update storage
          editor.storage[this.name].activeRef = activeRef
          // Create transaction with meta info
          const tr = editor.state.tr
          tr.setMeta('updateRefHighlight', true)
          tr.setMeta('newActiveRef', activeRef)
          tr.setMeta('addToHistory', false)
          // Dispatch the transaction
          editor.view.dispatch(tr)
          // Schedule a state update
          requestAnimationFrame(() => {
            if (editor.view) {
              const state = editor.view.state
              const tr = state.tr.setSelection(state.selection)
              editor.view.dispatch(tr)
            }
          })

          return true
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('refHighlightRerender'),
        appendTransaction: (transactions, oldState, newState) => {
          // Check if we need to rerender
          const shouldRerender = transactions.some(
            tr => tr.getMeta('updateRefHighlight') || tr.getMeta('forceRerender') || tr.docChanged
          )

          if (shouldRerender) {
            const tr = newState.tr
            tr.setMeta('addToHistory', false)

            // Instead of using setNodeMarkup, we'll recreate marks
            newState.doc.descendants((node, pos) => {
              if (node.isText && node.marks.length > 0) {
                const refHighlightMark = node.marks.find(m => m.type.name === this.name)
                if (refHighlightMark) {
                  // Remove and re-add the mark to force a rerender
                  tr.removeMark(pos, pos + node.nodeSize, this.type)
                  tr.addMark(pos, pos + node.nodeSize, refHighlightMark)
                }
              }
            })

            return tr
          }
          return null
        },
      }),
    ]
  },
})
