import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HytModal, HytModalService } from '@hyperiot/components';

@Component({
  selector: 'hyt-algorithm-wizard-report-modal',
  templateUrl: './algorithm-wizard-report-modal.component.html',
  styleUrls: ['./algorithm-wizard-report-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlgorithmWizardReportModalComponent extends HytModal {

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
