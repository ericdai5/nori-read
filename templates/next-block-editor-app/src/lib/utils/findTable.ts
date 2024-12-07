import { Node } from '@tiptap/pm/model'

export function findTableNodeById(doc: Node, uid: string): Node | null {
  let foundNode: Node | null = null
  doc.descendants(node => {
    if (node?.type?.name === 'table' && node.attrs && node.attrs.id === uid) {
      foundNode = node
      return false // Stop traversing once found
    }
  })
  return foundNode
}
