import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

/** Translated `mat-paginator` labels: provide it in the component. */
@Injectable()
export class AdminPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = $localize`:@@HYT_paginator_items_per_page:Items per page:`;
  override nextPageLabel = $localize`:@@HYT_paginator_next_page:Next page`;
  override previousPageLabel = $localize`:@@HYT_paginator_previous_page:Previous page`;
  override firstPageLabel = $localize`:@@HYT_paginator_first_page:First page`;
  override lastPageLabel = $localize`:@@HYT_paginator_last_page:Last page`;

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return $localize`:@@HYT_paginator_range_empty:0 of ${length}:length:`;
    }
    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);
    return $localize`:@@HYT_paginator_range:${start}:start: – ${end}:end: of ${length}:length:`;
  };
}
