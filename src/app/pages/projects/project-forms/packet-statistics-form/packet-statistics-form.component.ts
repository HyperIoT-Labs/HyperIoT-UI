import { Component, OnDestroy, ViewChild, ElementRef, Injector } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService } from '@hyperiot/core';
import { ProjectFormEntity } from '../project-form-entity';

@Component({
  selector: 'hyt-packet-statistics-form',
  templateUrl: './packet-statistics-form.component.html',
  styleUrls: ['./packet-statistics-form.component.scss']
})
export class PacketStatisticsFormComponent extends ProjectFormEntity implements OnDestroy {
  private routerSubscription: Subscription;
  private packetId: number;

  constructor(
    injector: Injector,
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(injector);
    this.longDefinition = this.entitiesService.statistic.longDefinition;
    this.formTitle = this.entitiesService.statistic.formTitle;
    this.hideDelete = true; // hide 'Delete' button
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
