import { findChildren } from '@tiptap/core'
import type { Node } from 'prosemirror-model'

export const findTableNodeById = (doc: Node, id: string) => {
  const result = findChildren(doc, node => {
    return node.type.name === 'table' && node.attrs.id === id
  })

  return result[0] // Returns { node, pos }
}
