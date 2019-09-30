import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { HProject } from '@hyperiot/core';

@Component({
  selector: 'hyt-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ProjectCardComponent implements OnInit {
  @Input() project: HProject;
  isActive = false;
  deviceCount = 0;
  rulesCount = 0;
  activeTimeout;

  constructor() { }

  ngOnInit() {
    /* Find All Device */
    this.deviceCount = this.project.deviceCount;

    /* Find All Device */
    this.rulesCount = this.project.rulesCount;
  }

  setActive(active) {
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
    }
    this.activeTimeout = setTimeout(() => this.isActive = active, 50);
  }

  deleteProject() {
    confirm('Do you want to delete the project?');
  }

}
