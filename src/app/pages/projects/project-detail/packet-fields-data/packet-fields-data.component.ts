import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService, HPacket } from '@hyperiot/core';

@Component({
  selector: 'hyt-packet-fields-data',
  templateUrl: './packet-fields-data.component.html',
  styleUrls: ['./packet-fields-data.component.scss']
})
export class PacketFieldsDataComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription;
  private packetId: number;

  packet: HPacket = {} as HPacket;
  packetList: HPacket[] = [];

  constructor(
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = +(activatedRoute.snapshot.params.packetId);
        // TODO: load data
        this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
          this.packet = p;
          // TODO: temporary bound fields that will be removed
          console.log(this.packet)
          this.hPacketService.findAllHPacketByProjectId(this.packet.device.project.id)
            .subscribe((pl: HPacket[]) => {
              this.packetList = pl;
              console.log(this.packetList);
            });
        });
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  packetsOutputChanged($event) {
    console.log($event);
  }
}
