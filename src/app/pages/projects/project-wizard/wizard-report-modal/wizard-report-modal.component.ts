import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HytModal, HytModalService } from '@hyperiot/components';

@Component({
  selector: 'hyt-wizard-report-modal',
  templateUrl: './wizard-report-modal.component.html',
  styleUrls: ['./wizard-report-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WizardReportModalComponent extends HytModal {

  constructor(
    private router: Router,
    hytModalService: HytModalService
  ) {
    super(hytModalService);
  }

  goToDashboard() {
    this.router.navigate(['/dashboards']);
    this.close();
  }

  goToProjectWizard() {
    this.router.navigate(['/projects']);
    this.close();
  }

}
