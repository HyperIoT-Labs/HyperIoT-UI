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

  autoSelect(): void {
    this.unfreezeSelection();
    this.selectForm.get('selectDevice').setValue(this.devicesOptions[0].value);
    this.deviceChanged(this.devicesOptions[0]);
  }

  deviceChanged(event): void {
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

  packetChanged(event): void {
    this.selectedPacket = event.value;
    this.currentPacket.emit(this.selectedPacket);
  }

  setPacket(packet: HPacket): void {
    console.log(this.devicesOptions);
    let device = this.devicesOptions.find(x => x.value.id == packet.device.id).value;
    this.selectedDevice = device;
    this.selectForm.get('selectDevice').setValue(device);
    this.packetsOptions = [];
    this.wizardService.hPackets.filter(p => p.device.id == this.selectedDevice.id).forEach(p => this.packetsOptions.push({ value: p, label: p.name }));
    console.log(this.packetsOptions);
    let pack = this.packetsOptions.find(y => y.value.id == packet.id).value;
    this.selectForm.get('selectPacket').setValue(pack);
  }

  freezeSelection() {
    this.selectForm.get('selectDevice').disable();
    this.selectForm.get('selectPacket').disable();
  }

  unfreezeSelection() {
    this.selectForm.get('selectDevice').enable();
    this.selectForm.get('selectPacket').enable();
  }

}
