import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from 'components';

@Component({
    selector: 'hyt-algorithm-wizard-report-modal',
    templateUrl: './algorithm-wizard-report-modal.component.html',
    styleUrls: ['./algorithm-wizard-report-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class AlgorithmWizardReportModalComponent {

  constructor(
    private router: Router,
    private dialogRef: DialogRef<void>,
  ) { }

  goToAlgorithmsWizard() {
    this.router.navigate(['/algorithms']);
    this.dialogRef.close();
  }

}
