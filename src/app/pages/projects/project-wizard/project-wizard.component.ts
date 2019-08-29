import { Component, OnInit } from '@angular/core';
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

  constructor(
  ) { }

  ngOnInit() {

  }

  updateProject(proj: HProject) {
    this.hProject = proj;
  }

  updateDevices(dev: HDevice[]) {
    this.hDevices = [...dev];
  }

  updatePackets(pac: HPacket[]) {
    this.hPackets = [...pac];
  }

}
