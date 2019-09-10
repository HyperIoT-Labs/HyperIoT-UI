import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HdevicesService, HDevice } from '@hyperiot/core';

@Component({
  selector: 'hyt-device-data',
  templateUrl: './device-data.component.html',
  styleUrls: ['./device-data.component.scss']
})
export class DeviceDataComponent implements OnInit {
  deviceId: number;
  device: HDevice = {} as HDevice;

  constructor(
    private hDeviceService: HdevicesService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.deviceId = activatedRoute.snapshot.params.deviceId;
        this.hDeviceService.findHDevice(this.deviceId).subscribe((d) => {
          this.device = d;
        });
      }
    });
  }

  ngOnInit() {
  }

}
