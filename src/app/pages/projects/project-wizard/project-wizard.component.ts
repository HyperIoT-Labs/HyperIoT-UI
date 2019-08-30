import { Component, OnInit, ViewChild } from '@angular/core';
import { HProject, HDevice, HPacket } from '@hyperiot/core';

@Component({
  selector: 'hyt-project-wizard',
  templateUrl: './project-wizard.component.html',
  styleUrls: ['./project-wizard.component.scss']
})
export class ProjectWizardComponent implements OnInit {

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

  constructor(
  ) { }

  ngOnInit() {

  }

  updateProject(proj: HProject) {
    this.hProject = proj;
    if (this.hProject)
      this.projectValidated = true;
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

}
