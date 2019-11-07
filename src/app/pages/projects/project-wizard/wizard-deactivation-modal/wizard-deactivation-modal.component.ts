import { Component, OnInit } from '@angular/core';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';

@Component({
  selector: 'hyt-wizard-deactivation-modal',
  templateUrl: './wizard-deactivation-modal.component.html',
  styleUrls: ['./wizard-deactivation-modal.component.scss']
})
export class WizardDeactivationModalComponent implements OnInit {

  constructor(
    private modalService: HytModalConfService
  ) { }

  ngOnInit() {
  }

}
