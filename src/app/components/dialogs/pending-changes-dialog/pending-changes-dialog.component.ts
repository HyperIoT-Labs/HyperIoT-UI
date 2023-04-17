import { Component } from '@angular/core';
import { HytModal, HytModalService } from 'components';

@Component({
  selector: 'hyt-pending-changes-dialog',
  templateUrl: './pending-changes-dialog.component.html',
  styleUrls: ['./pending-changes-dialog.component.scss']
})
export class PendingChangesDialogComponent extends HytModal {

  constructor(service: HytModalService) {
    super(service);
  }

}
