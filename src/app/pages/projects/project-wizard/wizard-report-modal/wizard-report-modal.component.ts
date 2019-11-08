import { Component, OnInit, Input, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HytModal } from 'src/app/services/hyt-modal';

@Component({
  selector: 'hyt-wizard-report-modal',
  templateUrl: './wizard-report-modal.component.html',
  styleUrls: ['./wizard-report-modal.component.scss']
})
export class WizardReportModalComponent extends HytModal implements OnInit {

  @Input()
  reportData: { imgPath: string, type: string, entities: string[] }[];

  constructor(
    injector: Injector,
    private router: Router
  ) {
    super(injector);
  }

  goToDashboard() {
    this.router.navigate(['/dashboards']);
  }

  goToProjectWizard() {
    this.router.navigate(['/projects']);
  }

}
