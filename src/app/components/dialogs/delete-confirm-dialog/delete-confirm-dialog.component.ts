import { Component } from '@angular/core';
import { HytModal, HytModalService } from '@hyperiot/components';

@Component({
  selector: 'hyt-delete-confirm-dialog',
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrls: ['./delete-confirm-dialog.component.scss']
})
export class DeleteConfirmDialogComponent extends HytModal {

  constructor(service: HytModalService) {
    super(service);
  }

}
