import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { HDevice, HPacket } from '@hyperiot/core';

@Component({
  selector: 'hyt-packet-select',
  templateUrl: './packet-select.component.html',
  styleUrls: ['./packet-select.component.scss']
})
export class PacketSelectComponent implements OnInit, OnChanges {

  @Input() hDevices: HDevice[] = [];

  @Input() hPackets: HPacket[] = [];

  currentDevice: HDevice;

  @Output() currentPacket = new EventEmitter<HPacket>();

  selectForm: FormGroup;

  devicesOptions: SelectOption[] = [];
  packetsOptions: SelectOption[] = [];

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.selectForm = this.fb.group({});
  }

  ngOnChanges() {
    if (this.devicesOptions.length != this.hDevices.length || this.packetsOptions.length != this.hPackets.length) {//TODO <- update onchange device/packets logic
      if (this.selectForm)
        this.selectForm.reset();
      this.devicesOptions = [];
      this.packetsOptions = [];
      this.currentPacket.emit(null);
      for (let el of this.hDevices)
        this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName })
    }
  }

  deviceChanged(event) {
    console.log("device");
    this.packetsOptions = [];
    this.currentDevice = this.hDevices.find(x => x.id == event.value);
    this.hPackets.filter(p => p.device.id == this.currentDevice.id).forEach(p => this.packetsOptions.push({ value: p.id.toString(), label: p.name }));
  }

  packetChanged(event) {
    console.log("packet");
    this.currentPacket.emit(this.hPackets.find(x => x.id == event.value));
  }

}
