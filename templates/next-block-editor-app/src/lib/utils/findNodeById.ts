import { findChildren } from '@tiptap/core'
import type { Editor } from '@tiptap/react'

export const findNodeById = (editor: Editor, id: string) => {
  const { state } = editor
  const { doc } = state

  const result = findChildren(doc, node => {
    return node.attrs && 'id' in node.attrs && node.attrs.id === id
  })

  console.log('Found nodes with id:', id, result)
  return result[0] // Returns the first matching node
}
