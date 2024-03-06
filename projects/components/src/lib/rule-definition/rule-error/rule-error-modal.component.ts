import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { DialogRef } from '../../hyt-dialog/dialog-ref';
import { DIALOG_DATA } from '../../hyt-dialog/dialog-tokens';

@Component({
  selector: 'hyt-rule-error-modal',
  templateUrl: './rule-error-modal.component.html',
  styleUrls: ['./rule-error-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RuleErrorModalComponent {

  constructor(
    private dialogRef: DialogRef<void>,
    @Inject(DIALOG_DATA) public data: { ruleDefinition: string },
  ) { }

  close() {
    this.dialogRef.close();
  }

}
