import { Injectable } from '@angular/core';
import { DialogService } from '../dialog.service';
import { ConfirmDialogConfig, ConfirmDialogResult } from './confirm-dialog.model';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { DialogConfig, DialogLayout } from '../dialog.models';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  constructor(
    private dialogService: DialogService,
  ) { }

  open(confirmConfig: ConfirmDialogConfig, layout?: DialogLayout) {
    return this.dialogService.open<ConfirmDialogComponent, ConfirmDialogConfig, ConfirmDialogResult>(
      ConfirmDialogComponent,
      { data: confirmConfig, ...layout }
    );
  }

}
