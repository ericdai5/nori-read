import { Mention } from '@tiptap/extension-mention'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { NodeSelection } from '@tiptap/pm/state'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

export const MentionPluginKey = new PluginKey('customMention')

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customMention: {
      /**
       * Toggle a mention
       */
      toggleMention: (attributes: { id: string; label: string; tableUid: string; parentId: string }) => ReturnType
    }
  }
}

export const CustomMention = Mention.extend({
  name: 'custom-mention',
  priority: 101,
  exitable: true,

  addAttributes() {
    return {
      // Keep the existing attributes using this.parent?.()
      ...this.parent?.(),
      tableUid: {
        default: null,
        parseHTML: element => element.getAttribute('data-tableUid'),
        renderHTML: attributes => {
          return {
            'data-tableUid': attributes.tableUid,
          }
        },
      },
      parentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-parentId'),
        renderHTML: attributes => {
          return {
            'data-parentId': attributes.parentId,
          }
        },
      },
    }
  },

  addCommands() {
    return {
      toggleMention:
        attributes =>
        ({ commands }) => {
          return commands.toggleMention(attributes)
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      new Plugin({
        key: MentionPluginKey,
        props: {
          handleDOMEvents: {
            click: (view: EditorView, event: MouseEvent) => {
              console.log('DOM event click')
              const mentionEl = (event.target as HTMLElement).closest('[data-type="custom-mention"]')
              if (!mentionEl) return false
              const pos = view.posAtDOM(mentionEl, 0)
              if (pos === undefined) return false
              event.preventDefault()
              const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos))
              view.dispatch(tr)
              requestAnimationFrame(() => {
                view.focus()
              })
              return true
            },
          },
        },
      }),
    ]
  },
})
