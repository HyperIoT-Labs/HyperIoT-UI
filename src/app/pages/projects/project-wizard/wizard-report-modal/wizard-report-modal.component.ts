import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DIALOG_DATA, DialogRef } from 'components';

@Component({
  selector: 'hyt-wizard-report-modal',
  templateUrl: './wizard-report-modal.component.html',
  styleUrls: ['./wizard-report-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WizardReportModalComponent {

  constructor(
    private router: Router,
    private dialogRef: DialogRef<void>,
    @Inject(DIALOG_DATA) public data: { iconPath: string; type:string; entities: string[] }[],
  ) { }

  goToDashboard() {
    this.router.navigate(['/dashboards']);
    this.dialogRef.close();
  }

  goToProjectWizard() {
    this.router.navigate(['/projects']);
    this.dialogRef.close();
  }

}
