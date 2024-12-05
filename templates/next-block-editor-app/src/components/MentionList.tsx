import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion'
import type { MentionSuggestion } from '@/extensions/CustomMention/suggestion'

export type MentionListRef = {
  // For convenience using this SuggestionList from within the
  // mentionSuggestionOptions, we'll match the signature of SuggestionOptions's
  // `onKeyDown` returned in its `render` function
  onKeyDown: NonNullable<ReturnType<NonNullable<SuggestionOptions<MentionSuggestion>['render']>>['onKeyDown']>
}

export default forwardRef<MentionListRef>((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item.id, label: item.label })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="bg-white rounded-lg shadow-md p-1 max-h-80 overflow-y-auto">
      {props.items.length ? (
        props.items.map((item: MentionSuggestion, index: number) => (
          <button
            className={`w-full text-left text-sm text-zinc-500 hover:text-zinc-700 px-2 py-1 rounded-md hover:bg-zinc-200 ${
              index === selectedIndex ? 'bg-zinc-100' : ''
            }`}
            key={item.id}
            onClick={() => selectItem(index)}
          >
            {item.label}
          </button>
        ))
      ) : (
        <div className="px-2 py-1 text-gray-500">No result</div>
      )}
    </div>
  )
})
