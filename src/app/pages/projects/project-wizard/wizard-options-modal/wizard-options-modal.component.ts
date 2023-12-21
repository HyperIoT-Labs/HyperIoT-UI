import { Component, ViewEncapsulation } from '@angular/core';
import { DialogRef } from 'components';
import { EntitiesService } from 'src/app/services/entities/entities.service';

@Component({
  selector: 'hyt-wizard-options-modal',
  templateUrl: './wizard-options-modal.component.html',
  styleUrls: ['./wizard-options-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WizardOptionsModalComponent {

  constructor(
    public entitiesService: EntitiesService,
    private dialogRef: DialogRef<any>,
  ) { }

  output(action?: string, data?: number) {
    this.dialogRef.close({ action, data });
  }

}
