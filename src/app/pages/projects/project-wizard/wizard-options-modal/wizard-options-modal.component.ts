import { Component, ViewEncapsulation } from '@angular/core';
import { HytModal, HytModalService } from '@hyperiot/components';
import { EntitiesService } from 'src/app/services/entities/entities.service';

@Component({
  selector: 'hyt-wizard-options-modal',
  templateUrl: './wizard-options-modal.component.html',
  styleUrls: ['./wizard-options-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WizardOptionsModalComponent extends HytModal {

  constructor(
    public entitiesService: EntitiesService,
    hytModalService: HytModalService
  ) {
    super(hytModalService);
  }

  output(action: string, data: number) {
    this.close({ action, data });
  }

}
