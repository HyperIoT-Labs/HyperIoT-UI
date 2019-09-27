import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService, HPacket } from '@hyperiot/core';

@Component({
  selector: 'hyt-packet-fields-data',
  templateUrl: './packet-fields-data.component.html',
  styleUrls: ['./packet-fields-data.component.scss']
})
export class PacketFieldsDataComponent implements OnDestroy {
  private routerSubscription: Subscription;
  private packetId: number;

  packet: HPacket;

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
        });
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

}
