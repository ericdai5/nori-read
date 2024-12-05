import { RawCommands } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    togglemMention: {
      /**
       * Toggle a mention on and off.
       */
      toggleMention: (attributes?: Record<string, any>) => ReturnType
    }
  }
}

export const toggleMention: RawCommands['toggleMention'] =
  (attributes = {}) =>
  ({ state, commands }) => {
    const { selection } = state
    const { $from, $to } = selection

    // Check if we're already on a mention
    const node = $from.nodeAfter
    const isMention = node?.type.name === 'custom-mention'

    if (isMention) {
      return true
    } else {
      return false
    }
  }
