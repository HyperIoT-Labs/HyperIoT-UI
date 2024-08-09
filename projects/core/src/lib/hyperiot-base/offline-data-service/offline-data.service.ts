import { Injectable } from '@angular/core';
import { asyncScheduler, BehaviorSubject, catchError, expand, map, Observable, Subject, Subscription, takeWhile, throwError } from 'rxjs';
import { HprojectsService } from '../../hyperiot-client/h-project-client/api-module';
import { BaseDataService } from '../base-data.service';
import { DataChannel } from '../models/data-channel';
import { DataPacketFilter } from '../models/data-packet-filter';
import { PacketData, PacketDataChunk } from '../models/packet-data';
import { OfflineDataChannelController } from './OfflineDataChannelController';
import { DateFormatterService } from '../../hyperiot-service/date-formatter/date-formatter.service';

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
  private dashboardTimeBounds = { lower: 0, upper: 0 };

  dashboardPackets: Subject<number[]>;

  private countSubscription: Subscription;

  isLoadAllRangeDataRunning = false;

  constructor(
    private hprojectsService: HprojectsService,
    private dateFormatterService: DateFormatterService
  ) {
    super();
    this.countEventSubject = new Subject<PageStatus>();
  }

  
  public resetService(hProjectId: number): Subject<number[]> {
    this.hProjectId = hProjectId;
    this.getEventCountEmpty(); // resetting time bounds and subscriptions
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

    // check if addDataChannel is afeter user timeline selection
    if (this.dashboardTimeBounds.lower > 0 && this.dashboardTimeBounds.upper > 0) {
      this.getEventCountByWidgetId(widgetId);
    }

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

  // Setting counter for specific widget
  // can avoid to reset data channel controller because this function is called after a new data channel is created so the controller is new
  
  private getEventCountByWidgetId(widgetId: number) {
    const dataChannel = this.dataChannels[widgetId];
    if (!dataChannel) {
      throw new Error('Unavailable dataChannel');
    }

    this.countEventSubject.next(PageStatus.Loading);

    // setting channelLowerBound in dataChannels
    dataChannel.controller.channelLowerBound = this.dashboardTimeBounds.lower;

    this.countSubscription = this.hprojectsService.timelineEventCount(
      this.hProjectId,
      this.dashboardTimeBounds.lower,
      this.dashboardTimeBounds.upper,
      dataChannel.getPacketIds().toString(),
      ''
    ).subscribe(
      (res: { totalCount: number; hpacketId:number; }[]) => {
        const channelCount = res.reduce((accumulator, currentValue) => accumulator + currentValue.totalCount, 0);
        dataChannel.controller.$totalCount.next(channelCount);
        this.countEventSubject.next(PageStatus.Standard);
      },
      err => {
        this.countEventSubject.next(PageStatus.Error);
      }
    );
  }

  // Setting counter after user selection
  
  public getEventCount(rowKeyLowerBound: number, rowKeyUpperBound: number): void {
    this.resetSubscription();
    this.countEventSubject.next(PageStatus.Loading);

    this.dashboardTimeBounds.lower = rowKeyLowerBound;
    this.dashboardTimeBounds.upper = rowKeyUpperBound;

    // setting channelLowerBound in dataChannels
    Object.values(this.dataChannels).forEach(dataChannel => {
      dataChannel.controller.channelLowerBound = this.dashboardTimeBounds.lower;
      dataChannel.controller.rangeLoaded = false;
    });

    this.countSubscription = this.hprojectsService.timelineEventCount(
      this.hProjectId,
      this.dashboardTimeBounds.lower,
      this.dashboardTimeBounds.upper,
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
    this.resetSubscription();
    this.dashboardTimeBounds.lower = 0;
    this.dashboardTimeBounds.upper = 0;
  }

  // reset actual subscription and data channel controllers 
  
  private resetSubscription() {
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }
    Object.values(this.dataChannels).forEach(dataChannel => {
      if(dataChannel.controller.dataSubscription) {
        dataChannel.controller.dataSubscription.unsubscribe();
      }
      dataChannel.controller.$totalCount.next(0);
    });
    this.countEventSubject.next(PageStatus.Standard);
  }

  // get paginated data
  scanAndSaveHProject(dataChannel: DataChannel, deviceId, alarmState, chunkLength = this.DEFAULT_CHUNK_LENGTH, lowerBound: number = dataChannel.controller.channelLowerBound): Observable<PacketDataChunk[]> {
    const packetIds = dataChannel.packetFilterList.map(packetFilter => packetFilter.packetId);
    return this.hprojectsService.scanHProject1(this.hProjectId, lowerBound, this.dashboardTimeBounds.upper, chunkLength, packetIds.toString(), deviceId, alarmState).pipe(
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
        let countConverted = 0;
        const convertData: PacketDataChunk[] = res.map(packetData => {
          countConverted += packetData.values.length;
          return {
            packetId: packetData.hPacketId,
            data: this.convertData(packetData.values, dataChannel)
          }
        });

        if(countConverted == 0){
          // NO MORE DATA TO LOAD
          dataChannel.controller.rangeLoaded = true;
        }

        // setting channel lower bound with new min rowKeyUpperBound
        dataChannel.controller.channelLowerBound = minRowKeyUpperBound + 1;
        return convertData;
      })
    );

  }

  // Download additional data for a specified channel
  
  public loadNextData(channelId: number): void {
    
    const dataChannel = this.dataChannels[channelId];
    if (!dataChannel) {
      throw new Error('unavailable dataChannel');
    }

    dataChannel.controller.dataSubscription = this.scanAndSaveHProject(dataChannel, '', '').subscribe(
      res => {
        res.forEach(packetDataChunk => dataChannel.subject.next(packetDataChunk));
      }
    );

  }

  // Convert offline data to PacketData
  
  private convertData(packetValues: any, dataChannel: DataChannel): PacketData[] {
    return packetValues.map(pv => {
      const convertedPV: PacketData = {};
      pv.fields.forEach(field => {
        if(dataChannel.controller.timestampToFormat && dataChannel.controller.timestampToFormat.has(field.name)){
          convertedPV[field.name] = this.dateFormatterService.formatTimestamp(field.value);
        }else{
          convertedPV[field.name] = field.value;

        }
      });
      convertedPV.timestamp = new Date(convertedPV[pv.timestampField]);

      return convertedPV;
    });
  }

  get isRangeSelected(){
    return this.dashboardTimeBounds.lower && this.dashboardTimeBounds.upper;
  }

  public loadAllRangeData(channelId: number): void {
    
    
    const dataChannel = this.dataChannels[channelId];
    if (!dataChannel) {
      throw new Error('unavailable dataChannel');
    }
    if(!this.isRangeSelected) {
      throw new Error('no range selected');
    }
    if (dataChannel.controller.isLoadAllRangeDataRunning) {
      return;
    }
    dataChannel.controller.isLoadAllRangeDataRunning = true;

    dataChannel.controller.dataSubscription = this.scanAndSaveHProject(dataChannel, '', '', 500)
    .pipe(
      expand(() => {
        return this.scanAndSaveHProject(dataChannel, '', '', 500);
      }),
      takeWhile(() => {
        if (dataChannel.controller.rangeLoaded) {
          dataChannel.controller.isLoadAllRangeDataRunning = false;
        }
        return !dataChannel.controller.rangeLoaded
      }),
      catchError(err => {
        return throwError(() => err);
      })
    )
    .subscribe({
      next: res => {
        res.forEach(packetDataChunk => dataChannel.subject.next(packetDataChunk));
      },
      error: err => {
        dataChannel.controller.isLoadAllRangeDataRunning = false;
        console.error('loadAllRangeData error:', err);
      }
    });
  }

}
