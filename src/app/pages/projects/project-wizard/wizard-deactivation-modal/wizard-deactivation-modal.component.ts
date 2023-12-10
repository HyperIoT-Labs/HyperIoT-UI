import { Component, ViewEncapsulation } from '@angular/core';
import { EntitiesService } from 'src/app/services/entities/entities.service';
import { DialogRef } from 'components';

@Component({
  selector: 'hyt-wizard-deactivation-modal',
  templateUrl: './wizard-deactivation-modal.component.html',
  styleUrls: ['./wizard-deactivation-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WizardDeactivationModalComponent {

  constructor(
    public entitiesService: EntitiesService,
    private dialogRef: DialogRef<boolean>,
  ) { }

  output(action: boolean) {
    this.dialogRef.close(action);
  }

}
