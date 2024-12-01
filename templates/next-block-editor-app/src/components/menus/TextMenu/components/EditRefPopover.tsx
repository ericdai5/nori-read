import { RefEditorPanel } from '@/components/panels'
import { Icon } from '@/components/ui/Icon'
import { Toolbar } from '@/components/ui/Toolbar'
import * as Popover from '@radix-ui/react-popover'

export type EditRefPopoverProps = {
  onSetRef: (id: string, sentence: string) => void
}

export const EditRefPopover = ({ onSetRef }: EditRefPopoverProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Toolbar.Button tooltip="Set Reference">
          <Icon name="Workflow" />
        </Toolbar.Button>
      </Popover.Trigger>
      <Popover.Content>
        <RefEditorPanel onSetRef={onSetRef} />
      </Popover.Content>
    </Popover.Root>
  )
}
