import { Icon } from '@/components/ui/Icon'
import { Surface } from '@/components/ui/Surface'
import { Toolbar } from '@/components/ui/Toolbar'
import Tooltip from '@/components/ui/Tooltip'

export type RefPreviewPanelProps = {
  id: string
  onEdit: () => void
  onClear: () => void
  isRefViewOpen?: boolean
  toggleRefView?: () => void
}

export const RefPreviewPanel = ({ onClear, onEdit, id, isRefViewOpen, toggleRefView }: RefPreviewPanelProps) => {
  return (
    <Surface className="flex items-center gap-2 p-2">
      {/* <a href={id} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all">
        {id}
      </a> */}
      <p className="text-sm">{id}</p>
      <Toolbar.Divider />
      <Tooltip title="Edit reference">
        <Toolbar.Button onClick={onEdit}>
          <Icon name="Pen" />
        </Toolbar.Button>
      </Tooltip>
      <Tooltip title="View reference">
        <Toolbar.Button
          tooltip={isRefViewOpen ? 'Close reference view' : 'Open reference view'}
          onClick={toggleRefView}
          active={isRefViewOpen}
          className={isRefViewOpen ? 'bg-transparent' : ''}
        >
          <Icon name="Eye" />
        </Toolbar.Button>
      </Tooltip>
      <Tooltip title="Remove reference">
        <Toolbar.Button onClick={onClear}>
          <Icon name="Trash2" />
        </Toolbar.Button>
      </Tooltip>
    </Surface>
  )
}
