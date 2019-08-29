import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { HDevice, HpacketsService, HPacket } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components/lib/hyt-select/hyt-select.component';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';

export enum myEnum {
  Customer = 1,
  Store = 2
}

@Component({
  selector: 'hyt-packets-step',
  templateUrl: './packets-step.component.html',
  styleUrls: ['./packets-step.component.scss']
})
export class PacketsStepComponent implements OnInit, OnChanges {

  @Input() hDevices: HDevice[] = [];

  devicesOptions: SelectOption[] = [];

  typologyOptions: Option[] = [];

  formatOptions: Option[] = [];

  serializationOptions: Option[] = [];

  trafficPlanOptions: SelectOption[] = [];

  packetForm: FormGroup;

  packetsList: HPacket[] = [];

  @Output() hPacketsOutput = new EventEmitter<HPacket[]>();

  formDeviceActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService
  ) { }

  ngOnInit() {

    Object.keys(HPacket.TypeEnum).forEach((key) => {
      this.typologyOptions.push({ value: HPacket.TypeEnum[key], label: HPacket.TypeEnum[key] })
    });

    Object.keys(HPacket.FormatEnum).forEach((key) => {
      this.formatOptions.push({ value: HPacket.FormatEnum[key], label: HPacket.FormatEnum[key] })
    });

    Object.keys(HPacket.SerializationEnum).forEach((key) => {
      this.serializationOptions.push({ value: HPacket.SerializationEnum[key], label: HPacket.SerializationEnum[key] })
    });

    Object.keys(HPacket.TrafficPlanEnum).forEach((key) => {
      this.trafficPlanOptions.push({ value: HPacket.TrafficPlanEnum[key], label: HPacket.TrafficPlanEnum[key] })
    });

    this.packetForm = this.fb.group({});
  }

  ngOnChanges() {
    this.devicesOptions = [];
    for (let el of this.hDevices)
      this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName })
    console.log(this.hDevices)
    console.log(this.devicesOptions)
  }

  type;
  format;
  serialization;

  createPacket() {

    let hPacket: HPacket = {
      entityVersion: 1,
      name: this.packetForm.value.packetIdentification,
      // type: this.packetForm.value.packetTypology,
      // format: this.packetForm.value.packetFormat,
      // serialization: this.packetForm.value.packetSerialization,
      type: this.type,
      format: this.format,
      serialization: this.serialization,
      trafficPlan: this.packetForm.value.packetTrafficPlan,
      timestampField: 'timestampField',
      timestampFormat: 'dd/MM/yyyy HH.mmZ',
      version: '1',
      device: { entityVersion: 1, id: +(this.packetForm.value.packetDevice) }
    }

    this.hPacketService.saveHPacket(hPacket).subscribe(
      res => {
        this.packetsList.push(hPacket);
        this.hPacketsOutput.emit(this.packetsList);
      },
      err => console.log(err)
    )
  }

  invalid() {
    return (
      this.packetForm.get('packetIdentification').invalid ||
      this.packetForm.get('packetDevice').invalid
      // this.packetForm.get('packetTypology').invalid ||
      // this.packetForm.get('packetFormat').invalid ||
      // this.packetForm.get('packetSerialization').invalid
    )
  }

  typologyOptionsChanged(e) {
    this.type = e.value;
  }
  formatOptionsChanged(e) {
    this.format = e.value;
  }
  serializationOptionsChanged(e) {
    this.serialization = e.value;
  }

  // "field": "hpacket-timestampfield",

  // "field": "hpacket-timestampformat",

  // "field": "hpacket-version",

}
