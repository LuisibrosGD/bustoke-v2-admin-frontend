import { Badge } from '../badge/badge';
import { Button } from '../button/button';

interface DataTableHeaderProps {
  title?: string;
  badgeLabel?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  buttonDisabled?: boolean;
  secondaryButtonLabel?: string;
  onSecondaryButtonClick?: () => void;
  secondaryButtonDisabled?: boolean;
  children?: React.ReactNode;
  addons?: React.ReactNode;
}

export function DataTableHeader(props: DataTableHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 md:py-4 md:px-8 flex-wrap gap-4">
      <div className="flex items-center gap-2  w-full justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold">{props.title}</h4>
          {props.badgeLabel && (
            <Badge variant="secondary">{props.badgeLabel}</Badge>
          )}
        </div>
        {!!props.addons && <div>{props.addons}</div>}
      </div>
      <div className="flex items-center gap-2">
        {props.secondaryButtonLabel && (
          <Button
            onClick={props.onSecondaryButtonClick}
            disabled={props.secondaryButtonDisabled}
            variant="outline"
            size="sm"
          >
            {props.secondaryButtonLabel}
          </Button>
        )}
        {props.buttonLabel && (
          <Button
            onClick={props.onButtonClick}
            disabled={props.buttonDisabled}
            size="sm"
          >
            {props.buttonLabel}
          </Button>
        )}
        {props.children}
      </div>
    </div>
  );
}
