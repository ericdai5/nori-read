import { mergeAttributes } from '@tiptap/core'
import { Figure } from '../Figure/Figure'
import { findCellClosestToPos } from '../Table/utils'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableFigure: {
      setTableFigure: () => ReturnType
      deleteTableFigure: () => ReturnType
    }
  }
}

export const TableFigure = Figure.extend({
  name: 'tableFigure',
  content: 'table figcaption',

  group: 'block',
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="tableFigure"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { 'data-type': 'tableFigure' }), 0]
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { empty, $anchor } = editor.state.selection

        // Check if we're inside a table cell
        const cell = findCellClosestToPos($anchor)
        if (cell) {
          return false
        }

        // Check if we're in figcaption
        if ($anchor.parent.type.name === 'figcaption') {
          const isAtStart = $anchor.parentOffset === 0
          const isEmpty = $anchor.parent.textContent.trim() === ''

          if (isEmpty) {
            editor.commands.insertContent({
              type: 'text',
              text: 'Please name this table',
            })
            return true
          }

          if (!isAtStart) {
            return false
          }
        }

        if (!empty) {
          return false
        }

        return false
      },
      Delete: ({ editor }) => {
        const { empty, $anchor } = editor.state.selection

        // Check if we're inside a table cell
        const cell = findCellClosestToPos($anchor)
        if (cell) {
          return false
        }

        // Check if we're in an empty paragraph after the table figure
        if ($anchor.parent.type.name === 'paragraph' && empty && $anchor.parent.content.size === 0) {
          const prevNode = editor.state.doc.nodeAt($anchor.before() - 1)
          if (prevNode?.type.name === this.name) {
            return editor.commands.deleteNode('paragraph')
          }
        }

        // Check if we're in figcaption
        if ($anchor.parent.type.name === 'figcaption') {
          const isAtEnd = $anchor.parentOffset === $anchor.parent.nodeSize - 2
          const isEmpty = $anchor.parent.textContent.trim() === ''

          if (isEmpty) {
            editor.commands.insertContent({
              type: 'text',
              text: 'Please name this table',
            })
            return true
          }

          if (!isAtEnd) {
            return false
          }
        }

        return false
      },
    }
  },

  addCommands() {
    return {
      setTableFigure:
        () =>
        ({ chain }) => {
          return chain()
            .focus()
            .insertContent({
              type: this.name,
              content: [
                {
                  type: 'table',
                  content: [
                    {
                      type: 'tableRow',
                      content: Array(3).fill({
                        type: 'tableCell',
                        content: [{ type: 'paragraph' }],
                      }),
                    },
                  ],
                },
                {
                  type: 'figcaption',
                  content: [{ type: 'text', text: 'Table caption' }],
                },
              ],
            })
            .run()
        },
      deleteTableFigure:
        () =>
        ({ commands }) => {
          return commands.deleteNode(this.name)
        },
    }
  },
})

export default TableFigure
