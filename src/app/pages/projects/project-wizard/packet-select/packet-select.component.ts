import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { HDevice, HPacket } from '@hyperiot/core';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-pw-packet-select',
  templateUrl: './packet-select.component.html',
  styleUrls: ['./packet-select.component.scss']
})
export class PacketSelectComponent implements OnInit {

  @Input() packetSelectId: number;

  selectForm: FormGroup;

  devicesOptions: SelectOption[] = [];
  packetsOptions: SelectOption[] = [];

  selectedDevice: HDevice;
  selectedPacket: HPacket;

  @Output() currentPacket = new EventEmitter<HPacket>();

  constructor(
    private fb: FormBuilder,
    private wizardService: ProjectWizardService
  ) { }

  ngOnInit() {
    this.selectForm = this.fb.group({});
    this.wizardService.autoSelect$[this.packetSelectId].subscribe(
      res => {
        this.devicesOptions = [];
        this.packetsOptions = [];
        for (let el of this.wizardService.hDevices)
          this.devicesOptions.push({ value: el, label: el.deviceName });
        this.autoSelect();
      }
    );
  }

  autoSelect() {
    this.selectForm.get('selectDevice').setValue(this.devicesOptions[0].value);
    this.deviceChanged(this.devicesOptions[0]);
  }

  deviceChanged(event) {
    this.selectedDevice = event.value;
    this.packetsOptions = [];
    this.selectForm.patchValue({
      selectPacket: null
    });
    this.currentPacket.emit(null);
    this.wizardService.hPackets.filter(p => p.device.id == this.selectedDevice.id).forEach(p => this.packetsOptions.push({ value: p, label: p.name }));
    this.selectForm.get('selectPacket').setValue(this.packetsOptions[0].value);
    this.packetChanged(this.packetsOptions[0]);
  }

  packetChanged(event) {
    this.selectedPacket = event.value;
    this.currentPacket.emit(this.selectedPacket);
  }

}
