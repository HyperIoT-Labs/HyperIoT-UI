import { Component, OnInit, Injector } from '@angular/core';
import { HytModal } from 'src/app/services/hyt-modal';

@Component({
  selector: 'hyt-rule-error-modal',
  templateUrl: './rule-error-modal.component.html',
  styleUrls: ['./rule-error-modal.component.scss']
})
export class RuleErrorModalComponent extends HytModal {

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

}
