import { Component, OnInit, Injector, ViewEncapsulation } from '@angular/core';
import { HytModal, HytModalService } from '@hyperiot/components';

@Component({
  selector: 'hyt-rule-error-modal',
  templateUrl: './rule-error-modal.component.html',
  styleUrls: ['./rule-error-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RuleErrorModalComponent extends HytModal {

  constructor(
    hytModalService: HytModalService
  ) {
    super(hytModalService);
  }

}
