import { Injectable } from '@angular/core';
import { asyncScheduler, map, Observable, Subject } from 'rxjs';
import { HprojectsService } from '../../hyperiot-client/h-project-client/api-module';
import { BaseDataService } from '../base-data.service';
import { DataChannel } from '../models/data-channel';
import { DataPacketFilter } from '../models/data-packet-filter';
import { PacketData, PacketDataChunk } from '../models/packet-data';
import { OfflineDataChannelController } from './OfflineDataChannelController';

enum PageStatus {
  Loading = 0,
  Standard = 1,
  New = 2,
  Error = -1
}

@Injectable({
  providedIn: 'root'
})
export class OfflineDataService extends BaseDataService {

  countEventSubject: Subject<PageStatus>;

  DEFAULT_CHUNK_LENGTH = 50;
  hProjectId;
  private dashboardRowKeyUpperBound = 0;

  dashboardPackets: Subject<number[]>;

  constructor(
    private hprojectsService: HprojectsService,
  ) {
    super();
    this.countEventSubject = new Subject<PageStatus>();
  }

  public resetService(hProjectId: number): Subject<number[]> {
    this.hProjectId = hProjectId;
    this.dashboardPackets = new Subject<number[]>();
    return this.dashboardPackets;
  }

  addDataChannel(widgetId: number, dataPacketFilterList: DataPacketFilter[]) {
    const dataChannel = super.addDataChannel(widgetId, dataPacketFilterList);
    const packetIds = this.getPacketIdsFromDataChannels();
    dataChannel.controller = new OfflineDataChannelController();

    // temporary fix until the dashboard can efficiently manage widget deletion
    asyncScheduler.schedule(() => {
      this.dashboardPackets.next(packetIds);
    });

    return dataChannel;
  }

  removeDataChannel(widgetId: number) {
    super.removeDataChannel(widgetId);
    const packetIds = this.getPacketIdsFromDataChannels();

    // temporary fix until the dashboard can efficiently manage widget deletion
    asyncScheduler.schedule(() => {
      this.dashboardPackets.next(packetIds);
    });

  }

  // Setting counter after user selection
  public getEventCount(
    rowKeyLowerBound: number,
    rowKeyUpperBound: number
  ): void {
    this.dashboardRowKeyUpperBound = rowKeyUpperBound;
    // setting channelLowerBound in dataChannels
    Object.values(this.dataChannels).forEach(dataChannel => {
      dataChannel.controller.channelLowerBound = rowKeyLowerBound;
    });
    this.hprojectsService.timelineEventCount(
      this.hProjectId,
      rowKeyLowerBound,
      this.dashboardRowKeyUpperBound,
      this.getPacketIdsFromDataChannels().toString(),
      ''
    ).subscribe((res) => {
      Object.values(this.dataChannels).forEach(dataChannel => {
        const channelCount = (res as { totalCount: number; hpacketId:number; }[])
          .filter(packetCount => dataChannel.getPacketIds().includes(packetCount.hpacketId))
          .reduce((accumulator, currentValue) => accumulator + currentValue.totalCount, 0);
        dataChannel.controller.$totalCount.next(channelCount);
      });
      this.countEventSubject.next(PageStatus.Standard);
    },
    err => {
      this.countEventSubject.next(PageStatus.Error);
    });
  }

  // Setting counter after user remove selection
  public getEventCountEmpty() {
    this.dashboardRowKeyUpperBound = 0;
    Object.values(this.dataChannels).forEach(dataChannel => {
      dataChannel.controller.$totalCount.next(0);
    });
  }

  scanAndSaveHProject(dataChannel: DataChannel, deviceId, alarmState): Observable<PacketDataChunk[]> {
    const packetIds = dataChannel.packetFilterList.map(packetFilter => packetFilter.packetId);
    return this.hprojectsService.scanHProject(this.hProjectId, dataChannel.controller.channelLowerBound, this.dashboardRowKeyUpperBound, this.DEFAULT_CHUNK_LENGTH, packetIds.toString(), deviceId, alarmState).pipe(
      map(res => {

        // TODO fix BE. This request should always return an array
        if(!Array.isArray(res)) {
          res = [res];
        }

        // removing extra data that exceed min rowKeyUpperBound
        const minRowKeyUpperBound = Math.min(res.map(packetData => packetData.rowKeyUpperBound));

        // applying data filtering only if multiple packet (prevent issue invalid date in Event data table)
        if (res.length > 1) {
          res.forEach(packetData => {
            packetData.values = packetData.values.filter(datum => datum.fields.find(x => x.name === datum.timestampField).value <= minRowKeyUpperBound);
          });
        }

        // converting data to packetData
        const convertData: PacketDataChunk[] = res.map(packetData => ({
          packetId: packetData.hPacketId,
          data: this.convertData(packetData.values)
        }));

        // setting channel lower bound with new min rowKeyUpperBound
        dataChannel.controller.channelLowerBound = minRowKeyUpperBound + 1;
        return convertData;
      })
    );

  }

  /**
   * Download additional data for a specified channel
   * @param channelId
   */
  public loadNextData(channelId: number): void {
    
    const dataChannel = this.dataChannels[channelId];
    if (!dataChannel) {
      throw new Error('unavailable dataChannel');
    }

    this.scanAndSaveHProject(dataChannel, '', '').subscribe(
      res => {
        res.forEach(packetDataChunk => dataChannel.subject.next(packetDataChunk));
      }
    );

  }

  /**
   * Convert offline data to PacketData
   * @param packetValues
   * @returns packetData
   */
  private convertData(packetValues: any): PacketData[] {
    return packetValues.map(pv => {
      const convertedPV: PacketData = {};
      pv.fields.forEach(field => {
        convertedPV[field.name] = field.value;
      });
      convertedPV.timestamp = new Date(convertedPV[pv.timestampField]);

      return convertedPV;
    });
  }

}
