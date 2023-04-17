import { Component, ViewEncapsulation } from '@angular/core';
import { EntitiesService } from 'src/app/services/entities/entities.service';
import { HytModal, HytModalService } from 'components';

@Component({
  selector: 'hyt-wizard-deactivation-modal',
  templateUrl: './wizard-deactivation-modal.component.html',
  styleUrls: ['./wizard-deactivation-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WizardDeactivationModalComponent extends HytModal {

  constructor(
    public entitiesService: EntitiesService,
    hytModalService: HytModalService
  ) {
    super(hytModalService);
  }

  output(action: boolean) {
    this.close(action);
  }

}
