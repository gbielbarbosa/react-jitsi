import React from 'react';

/**
 * Merges two sets of props, combining event handlers so both fire,
 * merging styles, and concatenating classNames.
 */
function mergeProps(
  childProps: Record<string, unknown>,
  slotProps: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...childProps };

  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    if (key === 'style') {
      // Merge styles (slot first, child overrides)
      merged[key] = { ...(slotValue as object), ...(childValue as object) };
    } else if (key === 'className') {
      // Concatenate classNames
      merged[key] = [slotValue, childValue].filter(Boolean).join(' ');
    } else if (key.startsWith('on') && typeof slotValue === 'function') {
      // Compose event handlers (both fire)
      if (typeof childValue === 'function') {
        merged[key] = (...args: unknown[]) => {
          (childValue as Function)(...args);
          (slotValue as Function)(...args);
        };
      } else {
        merged[key] = slotValue;
      }
    } else if (slotValue !== undefined) {
      merged[key] = slotValue;
    }
  }

  return merged;
}

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactElement;
}

/**
 * Slot component for the `asChild` pattern.
 *
 * Instead of rendering its own DOM element, it clones the child element
 * and merges the Slot's props into it. This allows transferring behavior
 * (onClick, aria-*, data-*, etc.) to a custom child element.
 *
 * Inspired by Radix UI's Slot primitive.
 *
 * @example
 * ```tsx
 * <Slot onClick={handleClick} aria-pressed={true}>
 *   <button className="custom">Click me</button>
 * </Slot>
 * // Renders: <button className="custom" onClick={handleClick} aria-pressed={true}>Click me</button>
 * ```
 */
export function Slot({ children, ...slotProps }: SlotProps) {
  if (!React.isValidElement(children)) {
    console.warn('[react-jitsi] Slot requires a valid React element as children when using asChild.');
    return null;
  }

  const childProps = children.props as Record<string, unknown>;
  const merged = mergeProps(childProps, slotProps);

  return React.cloneElement(children, merged);
}
