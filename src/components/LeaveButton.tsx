import React, { useCallback } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { PhoneOffIcon } from '../icons';

export interface LeaveButtonProps {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  confirmBeforeLeave?: boolean;
  confirmMessage?: string;
  onLeave?: () => void;
  asChild?: boolean;
  children?: React.ReactElement | ((leave: () => Promise<void>) => React.ReactNode);
}

export function LeaveButton({ className, style, label, confirmBeforeLeave = false, confirmMessage = 'Are you sure you want to leave the meeting?', onLeave, asChild, children }: LeaveButtonProps) {
  const { leave } = useJitsiContext();

  const handleLeave = useCallback(async () => {
    if (confirmBeforeLeave && !window.confirm(confirmMessage)) return;
    await leave();
    onLeave?.();
  }, [leave, confirmBeforeLeave, confirmMessage, onLeave]);

  if (typeof children === 'function') return <>{children(handleLeave)}</>;

  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={handleLeave} data-state="leave" aria-label="Leave meeting" title="Leave meeting" className={className} style={style}>{children}</Slot>;
  }

  return (
    <button className={`${label ? 'jr-leave-btn' : 'jr-leave-btn jr-leave-btn--icon-only'} ${className || ''}`}
      style={style} onClick={handleLeave} title="Leave meeting" aria-label="Leave meeting" type="button">
      <PhoneOffIcon />{label && <span>{label}</span>}
    </button>
  );
}
