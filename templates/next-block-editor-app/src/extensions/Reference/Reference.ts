import { Mark, mergeAttributes } from '@tiptap/core'

export interface ReferenceOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    reference: {
      /**
       * Set a reference mark
       */
      setRef: (attributes: { id: string; sentence: string }) => ReturnType
      /**
       * Toggle a reference mark
       */
      toggleRef: (attributes: { id: string; sentence: string }) => ReturnType
      /**
       * Unset a reference mark
       */
      unsetRef: () => ReturnType
    }
  }
}

export const Reference = Mark.create<ReferenceOptions>({
  name: 'reference',

  priority: 1000,

  keepOnSplit: false,

  exitable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class:
          'inline-flex items-center px-2 py-1 mx-1 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 reference-citation font-sans text-neutral-500 hover:text-neutral-700 dark:text-neutral-200 dark:hover:text-neutral-300 transition-transform hover:scale-105',
      },
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-reference-id'),
        renderHTML: attributes => {
          return {
            'data-reference-id': attributes.id,
          }
        },
      },
      sentence: {
        default: null,
        parseHTML: element => element.getAttribute('data-reference-sentence'),
        renderHTML: attributes => {
          return {
            'data-reference-sentence': attributes.sentence,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `span[data-reference-id]`,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setRef:
        attributes =>
        ({ chain }) => {
          return chain().setMark(this.name, attributes).run()
        },

      toggleRef:
        attributes =>
        ({ chain }) => {
          return chain().toggleMark(this.name, attributes, { extendEmptyMarkRange: true }).run()
        },

      unsetRef:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name, { extendEmptyMarkRange: true }).run()
        },
    }
  },
})
