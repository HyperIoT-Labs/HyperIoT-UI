import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
// TODO: fix it
// import { HytModal, DialogService } from 'components';
import { DialogService } from 'components';

@Component({
  selector: 'hyt-machinelearning-wizard-report-modal',
  templateUrl: './machinelearning-wizard-report-modal.component.html',
  styleUrls: ['./machinelearning-wizard-report-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
// TODO: fix it
// export class MachineLearningWizardReportModalComponent extends HytModal {
export class MachineLearningWizardReportModalComponent {

  constructor(
    private router: Router,
    hytModalService: DialogService
  ) {
    // TODO: fix it
    // super(hytModalService);
  }

  goToAlgorithmsWizard() {
    this.router.navigate(['/algorithms']);
    // TODO: fix it
    // this.close();
  }

}
