import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { SelectOptionGroup } from 'components';
import { HDevice, HDevicesService, HPacket, HPacketService } from 'core';

@Component({
  selector: 'hyperiot-packets-select',
  templateUrl: './packets-select.component.html',
  styleUrls: ['./packets-select.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PacketsSelectComponent implements OnInit {
  @Input() projectId: number;
  @Input() currentSelectedPackets: HPacket[] = [];
  @Input() required = false;

  allPackets: HPacket[] = [];

  selectedPacketOption: any;
  groupedPacketOptions: SelectOptionGroup[] = [];

  @Output() selectedPackets: EventEmitter<HPacket[]> = new EventEmitter<
    HPacket[]
  >();

  constructor(
    // private hDevicesService: HDevicesService,
    private hPacketsService: HPacketService,
  ) {}

  ngOnInit(): void {
    if (!this.projectId) {
      throw new Error('No projectId provided');
    }
    // setting selected initial option
    if (this.currentSelectedPackets.length) {
      this.selectedPacketOption = this.currentSelectedPackets.map(x => x.id);
    }
    this.hPacketsService
      .findAllHPacketByProjectId(this.projectId)
      .subscribe((res) => {
        this.allPackets = res;
        const devices = this.allPackets.map((x) => x.device);
        const groupDevices = [];
        devices.forEach((x) => {
          if (!groupDevices.some((y) => y.id === x.id)) {
            groupDevices.push(x);
          }
        });

        this.groupedPacketOptions = groupDevices.map((x) => ({
          name: x.deviceName,
          options: res
            .filter((y) => y.device.id === x.id)
            .map((y) => ({
              value: y.id,
              label: y.name,
              icon: 'icon-hyt_packets',
            })),
          icon: 'icon-hyt_device',
        }));
      });

    // this.hDevicesService
    //   .findAllHDeviceByProjectIdExtended(this.projectId)
    //   .subscribe((res: HDevice[]) => {
    //     // assigning each packet his device
    //     res.forEach((device) =>
    //       device.packets.forEach((packet) => {
    //         // avoiding circular structure
    //         packet.device = JSON.parse(JSON.stringify(device));
    //         this.allPackets.push(packet);
    //       })
    //     );

    //     this.groupedPacketOptions = res.map((device) => ({
    //       name: device.deviceName,
    //       options: device.packets.map((packet) => ({
    //         value: packet.id,
    //         label: packet.name,
    //         icon: 'icon-hyt_packets',
    //       })),
    //       icon: 'icon-hyt_device',
    //     }));

    //   });
  }

  packetChanged(packetOptions) {
    this.currentSelectedPackets = packetOptions.value.map(val => this.allPackets.find(p => p.id === val));
    this.selectedPackets.emit(this.currentSelectedPackets);
  }

}
