import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HdevicesService, HDevice } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'hyt-device-data',
  templateUrl: './device-data.component.html',
  styleUrls: ['./device-data.component.scss']
})
export class DeviceDataComponent implements OnInit {
  deviceId: number;
  device: HDevice = {} as HDevice;

  form: FormGroup;
  originalValue: string;

  constructor(
    private hDeviceService: HdevicesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({});
    this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.deviceId = activatedRoute.snapshot.params.deviceId;
        this.loadDevice();
      }
    });
  }

  ngOnInit() {
  }

  onSubmit() {
    // TODO: ...
  }

  isDirty(): boolean {
    return JSON.stringify(this.form.value) !== this.originalValue;
  }

  private loadDevice() {
    this.hDeviceService.findHDevice(this.deviceId).subscribe((d: HDevice) => {
      this.device = d;
      // update form data
      this.form.get('name')
        .setValue(d.deviceName);
      this.form.get('brand')
        .setValue(d.brand);
      this.form.get('model')
        .setValue(d.model);
      this.form.get('firmware')
        .setValue(d.firmwareVersion);
      this.form.get('software')
        .setValue(d.softwareVersion);
      this.form.get('description')
        .setValue(d.description);
      this.originalValue = JSON.stringify(this.form.value);
    });
  }
}
