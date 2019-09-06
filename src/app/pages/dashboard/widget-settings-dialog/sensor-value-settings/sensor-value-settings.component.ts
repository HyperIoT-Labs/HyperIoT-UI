import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subject } from 'rxjs';

import { PacketSelectComponent } from '../packet-select/packet-select.component';

@Component({
  selector: 'hyt-sensor-value-settings',
  templateUrl: './sensor-value-settings.component.html',
  styleUrls: ['../common.css', './sensor-value-settings.component.css']
})
export class SensorValueSettingsComponent implements OnInit, OnDestroy {
  @ViewChild(PacketSelectComponent, {static: true}) packetSelect: PacketSelectComponent;
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
