import { Injectable } from '@angular/core';
import { HPacketField, HPacket, HpacketsService } from '@hyperiot/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacketFieldService {

  private packet: HPacket;

  treeFields$: Subject<HPacketField[]> = new Subject<HPacketField[]>();

  constructor(
    private hPacketService: HpacketsService
  ) { }

  getTreeFields() {
    this.hPacketService.findTreeFields(this.packet.id).subscribe(
      (res: HPacketField[]) => this.treeFields$.next(res),
      err => this.treeFields$.error(err)
    );
  }

  setPacket(packet: HPacket) {
    this.packet = packet;
  }
  getPacket(): HPacket {
    return this.packet;
  }

  // return true if id and entityVersion on a provided packet are the same of the currentPacket
  checkPacket(packet: HPacket) {
    if (!this.packet) { return false; }
    return (this.packet.id === packet.id && this.packet.entityVersion === packet.entityVersion);
  }

}
