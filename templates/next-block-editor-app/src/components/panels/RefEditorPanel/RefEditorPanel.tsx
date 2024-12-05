import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Surface } from '@/components/ui/Surface'
import { Toggle } from '@/components/ui/Toggle'
import { useState, useCallback, useMemo } from 'react'

export type RefEditorPanelProps = {
  refId?: string
  sentence?: string
  onSetRef: (id: string, sentence: string) => void
}

export const useRefEditorState = ({ refId, sentence, onSetRef }: RefEditorPanelProps) => {
  const [id, setRefId] = useState(refId || '')
  const [sen, setSentence] = useState(sentence || '')

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRefId(event.target.value)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSetRef(id, sen)
    },
    [id, sen, onSetRef]
  )

  return {
    id,
    setRefId,
    sen,
    setSentence,
    onChange,
    handleSubmit,
  }
}

export const RefEditorPanel = ({ onSetRef, refId, sentence }: RefEditorPanelProps) => {
  const state = useRefEditorState({ onSetRef, refId, sentence })

  return (
    <Surface className="p-2">
      <form onSubmit={state.handleSubmit} className="flex items-center gap-2">
        <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 cursor-text">
          <Icon name="Workflow" className="flex-none text-black dark:text-white" />
          <input
            type="text"
            className="flex-1 bg-transparent outline-none min-w-[12rem] text-black text-sm dark:text-white"
            placeholder="Enter Reference ID"
            value={state.id}
            onChange={state.onChange}
          />
        </label>
        <Button variant="primary" buttonSize="small" type="submit">
          Set Reference
        </Button>
      </form>
    </Surface>
  )
}
