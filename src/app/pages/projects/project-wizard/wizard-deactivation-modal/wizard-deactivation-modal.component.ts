import { Component, OnInit, Injector, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { EntitiesService } from 'src/app/services/entities/entities.service';
import { HytModal, HytModalService } from '@hyperiot/components';

@Component({
  selector: 'hyt-wizard-deactivation-modal',
  templateUrl: './wizard-deactivation-modal.component.html',
  styleUrls: ['./wizard-deactivation-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WizardDeactivationModalComponent extends HytModal {

  // @Output()
  // modalClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public entitiesService: EntitiesService,
    hytModalService: HytModalService
  ) {
    super(hytModalService);
  }

  output(action: boolean) {
    // this.modalClose.emit(action);
    this.close(action);
  }

}
