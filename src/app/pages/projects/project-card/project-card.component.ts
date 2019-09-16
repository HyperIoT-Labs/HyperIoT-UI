import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { HProject, HDevice, HdevicesService, RulesService, Rule } from '@hyperiot/core';

@Component({
  selector: 'hyt-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  animations: [
    trigger('crossFade', [
        state('in', style({opacity: 1})),
        transition(':enter', [
          style({opacity: 0}),
          animate('200ms 10ms')
        ]),
        transition(':leave', [
          animate('200ms 10ms', style({opacity: 0}))
        ])
      ]
    )
]
})
export class ProjectCardComponent implements OnInit {
  @Input() project: HProject;
  isActive = false;
  deviceCount = 0;
  rulesCount = 0;
  activeTimeout;

  constructor(
    private hDeviceService: HdevicesService,
    private ruleService: RulesService
  ) { }

  ngOnInit() {
    this.hDeviceService.findAllHDevice().subscribe((deviceList: HDevice[]) => {
      deviceList.forEach((d: HDevice) => {
        d.project && d.project.id === this.project.id && this.deviceCount++;
      });
    });
    this.ruleService.findAllRule().subscribe((ruleList: Rule[]) => {
        ruleList.forEach((r: Rule) => {
          r.project && r.project.id === this.project.id && this.rulesCount++;
        });
    });
  }

  setActive(active) {
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
    }
    this.activeTimeout = setTimeout(() => this.isActive = active, 100);
  }

}
