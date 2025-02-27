import { Highlight } from '@tiptap/extension-highlight'
import { findParentNode } from '@tiptap/core'
import { CellSelection, TableMap } from '@tiptap/pm/tables'
import { Editor } from '@tiptap/core'
import { Node, Mark } from '@tiptap/pm/model'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'
import { RefViewState } from '@/hooks/useRefView'
import { Editor as CoreEditor } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    refHighlight: {
      setRefHighlight: (attributes?: { color: string; refId?: string | null }) => ReturnType
      unsetRefHighlight: () => ReturnType
      updateRefHighlight: (activeRef: string | null) => ReturnType
      updateRefHighlightState: () => ReturnType
    }
  }
}

interface RefHighlightStorage {
  activeRef: string | null
}

export const RefHighlight = Highlight.extend<RefHighlightStorage>({
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
          console.log('RefHighlight.tsx: state:', attributes.state)

          const isActive = attributes.state === 'on'

          console.log('isActive', isActive)

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
      state: {
        default: 'on',
        parseHTML: element => element.getAttribute('data-state'),
        renderHTML: attributes => ({
          'data-state': attributes.state,
        }),
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setRefHighlight:
        attributes =>
        ({ chain, editor }) => {
          // Add debug log
          console.log('setRefHighlight called with attributes:', attributes)

          // const activeRef = editor.storage.refHighlight?.activeRef
          // const actualRef = attributes?.refId === activeRef ? 'on' : 'off'

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
                      refId: editor.storage.refHighlight?.activeRef,
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
              refId: editor.storage.refHighlight?.activeRef,
              state: 'on',
            })
            .updateRefHighlightState()
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
            .updateRefHighlightState()
            .unsetHighlight()
            .run()
        },

      updateRefHighlightState:
        () =>
        ({ chain, editor }) => {
          console.log('Updating highlight states with activeRef:', editor.storage.refHighlight?.activeRef)
          return chain()
            .command(({ tr, state, dispatch }) => {
              if (!dispatch) return true

              const { doc, schema } = state
              const activeRef = editor.storage.refHighlight?.activeRef

              let hasChanges = false
              // Process all nodes in the document
              doc.descendants((node, pos) => {
                const marks = node.marks.filter(mark => mark.type.name === 'refHighlight')
                if (marks.length > 0) {
                  marks.forEach(mark => {
                    console.log('Processing mark:', {
                      refId: mark.attrs.refId,
                      currentState: mark.attrs.state,
                    })
                    console.log('Current activeRef:', activeRef)
                    const newState = mark.attrs.refId === activeRef ? 'on' : 'off'
                    console.log('New state:', newState)
                    tr.addMark(
                      pos,
                      pos + node.nodeSize,
                      schema.marks.refHighlight.create({
                        ...mark.attrs,
                        state: newState,
                      })
                    )
                  })
                }
              })

              if (hasChanges) {
                dispatch(tr)
              }

              return true
            })
            .run()
        },

      updateRefHighlight:
        (activeRef: string | null) =>
        ({ editor }) => {
          console.log('RefHighlight.tsx: Updating storage activeRef to:', activeRef)
          // Ensure we're always dealing with string | null, never empty string
          const normalizedRef = activeRef === '' ? null : activeRef
          editor.storage[this.name] = editor.storage[this.name] || { activeRef: null }
          editor.storage[this.name].activeRef = normalizedRef
          return true
        },
    }
  },
})
