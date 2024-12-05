import { Node } from '@tiptap/pm/model'

export function findTableNodeByUid(doc: Node, uid: string): Node | null {
  let foundNode: Node | null = null

  doc.descendants((node, pos) => {
    if (node.type.name === 'table' && node.attrs.uid === uid) {
      foundNode = node
      return false // Stop traversing once found
    }
  })

  return foundNode
}
