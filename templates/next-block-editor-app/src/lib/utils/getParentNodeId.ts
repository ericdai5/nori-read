import { Selection } from '@tiptap/pm/state'

export const getParentNodeId = (selection: Selection) => {
  const $anchor = selection.$anchor

  let parentId = $anchor.parent.attrs.id

  return parentId
}
