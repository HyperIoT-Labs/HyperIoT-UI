import { Component } from '@angular/core';
import { HytModal, HytModalService } from 'components';

@Component({
  selector: 'hyt-save-changes-dialog',
  templateUrl: './save-changes-dialog.component.html',
  styleUrls: ['./save-changes-dialog.component.scss']
})
export class SaveChangesDialogComponent extends HytModal {

  constructor(service: HytModalService) {
    super(service);
  }

}
