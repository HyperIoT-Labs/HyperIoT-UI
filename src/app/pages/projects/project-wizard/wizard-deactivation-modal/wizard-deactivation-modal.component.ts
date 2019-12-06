import { Component, OnInit, Injector, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { EntitiesService } from 'src/app/services/entities/entities.service';
import { HytModal } from 'src/app/services/hyt-modal';

@Component({
  selector: 'hyt-wizard-deactivation-modal',
  templateUrl: './wizard-deactivation-modal.component.html',
  styleUrls: ['./wizard-deactivation-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WizardDeactivationModalComponent extends HytModal implements OnInit {

  @Output()
  modalClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    injector: Injector,
    public entitiesService: EntitiesService
  ) {
    super(injector);
  }

  output(action: boolean) {
    this.modalClose.emit(action);
    this.close();
  }

}
