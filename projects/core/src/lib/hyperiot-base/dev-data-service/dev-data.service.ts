import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { BaseDataService } from '../base-data.service';
import { DataChannel } from '../models/data-channel';
import { PacketData, PacketDataChunk } from '../models/packet-data';

export interface DevDataSettings {
  interval?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DevDataService extends BaseDataService {

  settings: DevDataSettings = {
    interval: 1000,
  }

  constructor() {
    super();
    this.connect();
  }

  connect() {

    interval(this.settings.interval).subscribe(
      res => {
        for (const id in this.dataChannels) {
          const channelData: DataChannel = this.dataChannels[id];

          const packetFilterList = channelData.packetFilterList;

          packetFilterList.forEach(packetFilter => {
            let fields: PacketData = {};
            Object.keys(packetFilter.fields).forEach(fieldId => {
              const fieldName = packetFilter.fields[fieldId];
              fields[fieldName] = Math.random();
            });
            fields.timestamp = new Date();
            const packetDataChunk: PacketDataChunk = {
              packetId: packetFilter.packetId,
              data: [fields]
            }
            channelData.subject.next(packetDataChunk);
          });

        }
      }
    );

  }


}
