export interface GridDimensions {
  cols: number;
  rows: number;
  width: number;
  height: number;
}

/**
 * Calculates the optimal grid layout (rows, cols, item dimensions) to maximize
 * the area of each item within a given container, respecting the aspect ratio.
 */
export function calculateGridSettings(
  containerWidth: number,
  containerHeight: number,
  count: number,
  aspectRatio: number = 16 / 9,
  gap: number = 8
): GridDimensions {
  if (count === 0 || containerWidth === 0 || containerHeight === 0) {
    return { cols: 1, rows: 1, width: 0, height: 0 };
  }

  let bestLayout: GridDimensions = { cols: 1, rows: 1, width: 0, height: 0 };
  let maxArea = 0;

  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);

    // Calculate dimensions minus gaps
    const availableWidth = containerWidth - (cols + 1) * gap;
    const availableHeight = containerHeight - (rows + 1) * gap;

    // Try fitting based on width
    let itemWidth = availableWidth / cols;
    let itemHeight = itemWidth / aspectRatio;

    if (itemHeight * rows > availableHeight) {
      // If it overflows height, fit based on height instead
      itemHeight = availableHeight / rows;
      itemWidth = itemHeight * aspectRatio;
    }

    // Must be positive dimensions
    if (itemWidth > 0 && itemHeight > 0) {
      const area = itemWidth * itemHeight;
      if (area > maxArea) {
        maxArea = area;
        bestLayout = {
          cols,
          rows,
          width: itemWidth,
          height: itemHeight,
        };
      }
    }
  }

  return bestLayout;
}
