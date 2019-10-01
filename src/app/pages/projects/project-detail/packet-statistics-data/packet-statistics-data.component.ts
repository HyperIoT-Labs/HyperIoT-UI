import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService } from '@hyperiot/core';

@Component({
  selector: 'hyt-packet-statistics-data',
  templateUrl: './packet-statistics-data.component.html',
  styleUrls: ['./packet-statistics-data.component.scss']
})
export class PacketStatisticsDataComponent implements OnDestroy {
  private routerSubscription: Subscription;
  private packetId: number;

  constructor(
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = +(activatedRoute.snapshot.params.packetId);
        // TODO: load data
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

}
