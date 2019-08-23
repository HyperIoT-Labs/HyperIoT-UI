import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';
import { PacketSelectComponent } from '../packet-select/packet-select.component';
import { NgForm, ControlContainer } from '@angular/forms';

@Component({
  selector: 'hyt-sensor-value-settings',
  templateUrl: './sensor-value-settings.component.html',
  styleUrls: ['./sensor-value-settings.component.css'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class SensorValueSettingsComponent implements OnInit, OnDestroy {
  @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
  @Input() modalApply: Subject<any>;
  @Input() widget;

  constructor(public settingsForm: NgForm) { }

  ngOnInit() {
    this.modalApply.subscribe((event) => {
      if (event === 'apply') {
        this.apply();
      }
    });
  }
  ngOnDestroy() {
    this.modalApply.unsubscribe();
  }

  apply() {
    this.packetSelect.apply();
  }

}
