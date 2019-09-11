import { Component, OnInit, ViewChild } from '@angular/core';
import { HProject, HDevice, HPacket } from '@hyperiot/core';
import { Router } from '@angular/router';

@Component({
  selector: 'hyt-project-wizard',
  templateUrl: './project-wizard.component.html',
  styleUrls: ['./project-wizard.component.scss']
})
export class ProjectWizardComponent implements OnInit {

  @ViewChild('stepper', { static: false }) stepper;

  hProject: HProject;
  hDevices: HDevice[] = [];
  hPackets: HPacket[] = [];

  projectValidated: boolean = false;
  devicesValidated: boolean = false;
  packetsValidated: boolean = false;
  fieldsValidated: boolean = false;
  enrichmentValidated: boolean = false;
  statisticsValidated: boolean = false;
  eventsValidated: boolean = false;

  ovpOpen: boolean = false;
  finishOpen: boolean = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit() { }

  updateProject(proj: HProject) {
    this.hProject = proj;
    if (this.hProject)
      this.projectValidated = true;
    setTimeout(() => {
      this.stepper.next();
    }, 0);
  }

  updateDevices(dev: HDevice[]) {
    this.hDevices = [...dev];
    if (this.hDevices.length != 0)
      this.devicesValidated = true;
  }

  updatePackets(pac: HPacket[]) {
    this.hPackets = [...pac];
    if (this.hPackets.length != 0)
      this.packetsValidated = true;
  }

  updatePacketFields(pac: HPacket[]) {
    this.hPackets = [...pac];
    if (this.hPackets[0].fields.length != 0)
      this.fieldsValidated = true;
  }

  openOptionModal() {
    this.ovpOpen = true;
    this.enrichmentValidated = true;
    this.statisticsValidated = true;
    this.eventsValidated = true;
  }

  closeOptionModal() {
    this.ovpOpen = false;
  }

  openFinishModal() {
    this.ovpOpen = false;
    this.finishOpen = true;
  }

  closeFinishModal() {
    this.finishOpen = false;
  }

  goToStepByIndex(index: number) {
    this.stepper.changeStep(index);
    this.closeOptionModal();
  }

  goToDashboard() {
    this.router.navigate(['/dashboards']);
  }

  goToProjectWizard() {
    this.router.navigate(['/projects']);
  }

}
