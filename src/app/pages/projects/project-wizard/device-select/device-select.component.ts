import { Component, OnChanges, Input, EventEmitter, Output } from '@angular/core';
import { HDevice } from '@hyperiot/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';

@Component({
  selector: 'hyt-device-select',
  templateUrl: './device-select.component.html',
  styleUrls: ['./device-select.component.scss']
})
export class DeviceSelectComponent implements OnChanges {

  @Input() hDevices: HDevice[];

  selectForm: FormGroup;

  devicesOptions: SelectOption[] = [];

  @Output() selectedDevice = new EventEmitter<HDevice>();

  constructor(
    private fb: FormBuilder
  ) {
    this.selectForm = this.fb.group({});
  }

  ngOnChanges(): void {
    console.log(this.hDevices);
    this.devicesOptions = [];
    this.hDevices.forEach(device => {
      this.devicesOptions.push({
        value: device,
        label: device.deviceName
      })
    });
    this.autoSelect();
  }

  deviceChanged(event){
    this.selectedDevice.emit(event.value);
  }

  autoSelect() {
    //TODO...
  }

}
