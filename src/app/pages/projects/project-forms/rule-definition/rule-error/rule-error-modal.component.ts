import { Component, ViewEncapsulation } from '@angular/core';
import { DialogRef } from 'components';

@Component({
  selector: 'hyt-rule-error-modal',
  templateUrl: './rule-error-modal.component.html',
  styleUrls: ['./rule-error-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RuleErrorModalComponent {

  constructor(
    private dialogRef: DialogRef<void>,
  ) { }

  close() {
    this.dialogRef.close();
  }

}
