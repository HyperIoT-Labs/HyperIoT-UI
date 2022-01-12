import { Component, OnInit, Output, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { HDevice, HPacket } from '@hyperiot/core';

@Component({
  selector: 'hyt-pw-packet-select',
  templateUrl: './packet-select.component.html',
  styleUrls: ['./packet-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PacketSelectComponent implements OnInit {

  @Input() hDevices: HDevice[] = [];
  @Input() hPackets: HPacket[] = [];

  @Input() packetSelectId: number;

  selectForm: FormGroup;

  devicesOptions: SelectOption[] = [];
  packetsOptions: SelectOption[] = [];

  selectedDeviceId: number;
  selectedPacketId: number;

  @Output() currentPacket = new EventEmitter<number>();

  @Output() currentDevice = new EventEmitter<string>();

  

  constructor(
    private fb: FormBuilder
  ) {
    this.selectForm = this.fb.group({});
   }

  ngOnInit() {

  }

  buildDeviceOptions() {
    
    this.devicesOptions = this.hDevices.map(
      dev => {
        return ({
          value: dev.id, label: dev.deviceName, disabled: this.hPackets.filter(
            p => p.device.id === dev.id
          ).length === 0
        });
      }
    );

  }

  buildPacketOptions() {
    this.packetsOptions = this.hPackets
      .filter(p => p.device.id === this.selectedDeviceId)
      .map(pac => ({ value: pac.id, label: pac.name }));
  }

  buildSelects() {
    
    this.buildDeviceOptions();
    this.selectForm.get('selectDevice').setValue(this.selectedDeviceId);
    this.buildPacketOptions();
    this.selectForm.get('selectPacket').setValue(this.selectedPacketId);

    const currentDevice = this.getDeviceNameByID(this.selectForm.controls.selectDevice.value);
    this.currentDevice.emit(currentDevice);
    this.currentPacket.emit(this.selectForm.controls.selectPacket.value)
    
  }

  updateSelect() {
    if (!this.selectedDeviceId || !this.selectedPacketId) {
      this.autoSelect();
    } else {
      this.buildSelects();
    }
  }

  autoSelect(): void {
    
    this.buildDeviceOptions();
    let index = 0;
    if (this.devicesOptions.length !== 0) {
      while (index < this.devicesOptions.length && this.devicesOptions[index].disabled) {
        index++;
      }
      this.selectForm.get('selectDevice').setValue(this.devicesOptions[index] ?
        this.devicesOptions[index].value : null);
      this.deviceChanged(this.devicesOptions[index] ? this.devicesOptions[index] : null);
    } else {
      this.selectForm.get('selectDevice').setValue(null);
      this.deviceChanged(null);
    }
  }

  deviceChanged(event): void {
    if (event) {

      this.selectedDeviceId = event.value;
      
      if(event.label){
        this.currentDevice.emit(event.label);
      }

      if(event.constructor.name === 'MatSelectChange'){
        const deviceName = this.getDeviceNameByID(this.selectedDeviceId);
        this.currentDevice.emit(deviceName)
      }

      this.packetsOptions = [];
      this.selectForm.get('selectPacket').setValue(null);
      this.currentPacket.emit(null);
      this.buildPacketOptions();
      if (this.packetsOptions.length !== 0) {
        
        this.selectForm.get('selectPacket').setValue(this.packetsOptions[0].value);
        this.packetChanged(this.packetsOptions[0]);

      } else {
        this.currentPacket.emit(null);
      }
    } else {
      
      this.currentDevice.emit(null)

      this.packetsOptions = [];
      this.selectForm.get('selectPacket').setValue(null);
      this.currentPacket.emit(null);
      this.buildPacketOptions();
    }
  }

  packetChanged(event): void {
    this.selectedPacketId = event.value;
    this.currentPacket.emit(this.selectedPacketId);
  }

  getDeviceNameByID(deviceID: number): string {
    const deviceSelected = this.hDevices.find(el => el.id === deviceID);
    if(deviceSelected) {
      return deviceSelected.deviceName;
    } else {
      return '';
    }
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
