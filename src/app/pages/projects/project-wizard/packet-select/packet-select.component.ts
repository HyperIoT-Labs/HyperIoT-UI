import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { HDevice, HPacket, HpacketsService } from '@hyperiot/core';

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
  devicesLastLength: number = 0; //TODO <- update onchange device/packets logic
  packetsOptions: SelectOption[] = [];
  packetsLastLength: number = 0; //TODO <- update onchange device/packets logic

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService
  ) { }

  ngOnInit() {
    this.selectForm = this.fb.group({});
  }

  ngOnChanges() {
    if (this.devicesLastLength != this.hDevices.length || this.packetsLastLength != this.hPackets.length) {//TODO <- update onchange device/packets logic
      this.devicesLastLength = this.hDevices.length;
      this.packetsLastLength = this.hPackets.length;
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
    this.packetsOptions = [];
    this.currentPacket.emit(null);
    this.currentDevice = this.hDevices.find(x => x.id == event.value);
    this.hPackets.filter(p => p.device.id == this.currentDevice.id).forEach(p => this.packetsOptions.push({ value: p.id.toString(), label: p.name }));
  }

  packetChanged(event) {
    this.hPacketService.findHPacket(event.value).subscribe(
      res => this.currentPacket.emit(res)
    )
  }

}
