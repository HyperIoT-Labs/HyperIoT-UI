import { Subject } from 'rxjs';
import { DataPacketFilter } from './data-packet-filter';
import { PacketDataChunk } from './packet-data';

export class DataChannel {
  packetFilterList: DataPacketFilter[];
  controller?: any;
  subject: Subject<PacketDataChunk>;

  constructor(packetFilterList: DataPacketFilter[]) {
    this.packetFilterList = packetFilterList;
    this.subject = new Subject<PacketDataChunk>();
  }

  public getPacketIds(): number[] {
    return this.packetFilterList.map(packetFilter => packetFilter.packetId);
  }
}
