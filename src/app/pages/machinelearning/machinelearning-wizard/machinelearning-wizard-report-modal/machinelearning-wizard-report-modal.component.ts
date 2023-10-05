import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HytModal, HytModalService } from 'components';

@Component({
  selector: 'hyt-machinelearning-wizard-report-modal',
  templateUrl: './machinelearning-wizard-report-modal.component.html',
  styleUrls: ['./machinelearning-wizard-report-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MachineLearningWizardReportModalComponent extends HytModal {

  constructor(
    private router: Router,
    hytModalService: HytModalService
  ) {
    super(hytModalService);
  }

  goToAlgorithmsWizard() {
    this.router.navigate(['/algorithms']);
    this.close();
  }

}
