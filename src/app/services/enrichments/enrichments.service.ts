import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnrichmentsService {

  constructor() { }

  // Observable string sources
  private emitPacketSource = new Subject<any>();
  // Observable string sources
  private emitDeviceNameSource = new Subject<any>();
  // Observable string streams
  changePacket$ = this.emitPacketSource.asObservable();
  // Observable string streams
  changeDeviceName$ = this.emitDeviceNameSource.asObservable();
  // Service message commands
  emitPacket(packetID: number) {
      this.emitPacketSource.next(packetID);
  }
  // Service message commands
  emitDeviceName(packetID: string) {
    this.emitDeviceNameSource.next(packetID);
}

}
