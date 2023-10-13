import { Injectable } from '@angular/core';
import { DialogService } from '../dialog.service';
import { DialogLayout } from '../dialog.models';
import { InfoDialogConfig, InfoDialogResult } from './info-dialog.model';
import { InfoDialogComponent } from './info-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class InfoDialogService {
  constructor(
    private dialogService: DialogService,
  ) { }

  open(infoConfig: InfoDialogConfig, layout?: DialogLayout) {
    return this.dialogService.open<InfoDialogComponent, InfoDialogConfig, InfoDialogResult>(
      InfoDialogComponent,
      { data: infoConfig, ...layout }
    );
  }

}
