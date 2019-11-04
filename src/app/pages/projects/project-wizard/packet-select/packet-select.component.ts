import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
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

  @Input() hDevices: HDevice[] = [];
  @Input() hPackets: HPacket[] = [];

  @Input() packetSelectId: number;

  selectForm: FormGroup;

  devicesOptions: SelectOption[] = [];
  packetsOptions: SelectOption[] = [];

  selectedDevice: HDevice;
  selectedPacket: HPacket;

  @Output() currentPacket = new EventEmitter<HPacket>();

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.selectForm = this.fb.group({});
  }

  autoSelect(): void {
    this.devicesOptions = this.hDevices.map(dev => { return ({ value: dev, label: dev.deviceName, disabled: this.hPackets.filter(p => p.device.id == dev.id).length == 0 }) });
    let index = 0;
    while(this.devicesOptions[index].disabled){
      index++;
    }
    this.selectForm.get('selectDevice').setValue(this.devicesOptions[index].value);
    this.deviceChanged(this.devicesOptions[index]);
  }

  deviceChanged(event): void {
    this.selectedDevice = event.value;
    this.packetsOptions = [];
    this.selectForm.patchValue({
      selectPacket: null
    });
    this.currentPacket.emit(null);
    this.packetsOptions = this.hPackets.filter(p => p.device.id == this.selectedDevice.id).map(pac => { return ({ value: pac, label: pac.name }) });
    if(this.packetsOptions.length != 0){
      this.selectForm.get('selectPacket').setValue(this.packetsOptions[0].value);
      this.packetChanged(this.packetsOptions[0]);
    }
    else{
      this.currentPacket.emit(null);
    }
  }

  packetChanged(event): void {
    this.selectedPacket = event.value;
    this.currentPacket.emit(this.selectedPacket);
  }

  setPacket(packet: HPacket): void {
    // let device = this.devicesOptions.find(x => x.value.id == packet.device.id).value;
    // this.selectedDevice = device;
    // this.selectForm.get('selectDevice').setValue(device);
    // this.packetsOptions = [];
    // this.wizardService.hPackets.filter(p => p.device.id == this.selectedDevice.id).forEach(p => this.packetsOptions.push({ value: p, label: p.name }));
    // console.log(this.packetsOptions);
    // let pack = this.packetsOptions.find(y => y.value.id == packet.id).value;
    // this.selectForm.get('selectPacket').setValue(pack);
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
