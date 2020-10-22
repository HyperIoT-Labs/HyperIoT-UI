import { Component, OnDestroy, ViewChild, ElementRef, Injector, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { HpacketsService, HPacket, HProject, RulesService, Rule } from '@hyperiot/core';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { PacketEventsFormComponent } from '../packet-events-form/packet-events-form.component';
import { PacketFormComponent } from '../packet-form/packet-form.component';

@Component({
  selector: 'hyt-packet-events-select-form',
  templateUrl: './packet-events-select-form.component.html',
  styleUrls: ['./packet-events-select-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PacketEventsSelectFormComponent extends ProjectFormEntity implements OnDestroy {

  private activatedRouteSubscription: Subscription;

  private packetId: number;

  constructor(
    injector: Injector,
    private hPacketService: HpacketsService,
    private rulesService: RulesService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
    this.formTemplateId = 'container-events';
    this.activatedRouteSubscription = this.activatedRoute.params.subscribe(routeParams => {
      this.packetId = +(activatedRoute.snapshot.params.packetId);
      if (this.packetId) {
        // this.loadData();
      }
    });
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
  }

}
