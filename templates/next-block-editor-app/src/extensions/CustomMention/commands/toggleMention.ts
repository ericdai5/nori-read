import { RawCommands } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleMention: {
      /**
       * Toggle a mention on and off.
       */
      toggleMention: (attributes: { id: string; label: string; tableUid: string; sentence: string }) => ReturnType
    }
  }
}

export const toggleMention: RawCommands['toggleMention'] =
  attributes =>
  ({ state, commands }) => {
    const { selection } = state
    const { $from, $to } = selection

    // Check if we're already on a mention
    const node = $from.nodeAfter
    const isMention = node?.type.name === 'custom-mention'

    if (isMention) {
      // If it's already a mention, update its attributes
      return commands.updateAttributes('custom-mention', attributes)
    } else {
      // If it's not a mention, create one with the attributes
      return commands.insertContent({
        type: 'custom-mention',
        attrs: {
          id: attributes.id,
          label: attributes.label,
          tableUid: attributes.tableUid,
          sentence: attributes.sentence,
        },
      })
    }
  }
