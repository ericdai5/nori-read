import { Icon } from '@/components/ui/Icon'
import { Surface } from '@/components/ui/Surface'
import { Toolbar } from '@/components/ui/Toolbar'
import Tooltip from '@/components/ui/Tooltip'

export type CMentionPreviewProps = {
  isRefViewOpen?: boolean
  toggleRefView?: (data?: { id?: string; label?: string; tableUid?: string; parentId?: string }) => void
}

export const CMentionPreview = ({ isRefViewOpen, toggleRefView }: CMentionPreviewProps) => {
  return (
    <Surface className="flex items-center gap-2 p-2">
      <Tooltip title="View reference">
        <Toolbar.Button
          tooltip={isRefViewOpen ? 'Close reference view' : 'Open reference view'}
          onClick={() => toggleRefView?.()}
          active={isRefViewOpen}
          className={isRefViewOpen ? 'bg-transparent' : ''}
        >
          <Icon name="Eye" />
        </Toolbar.Button>
      </Tooltip>
    </Surface>
  )
}
