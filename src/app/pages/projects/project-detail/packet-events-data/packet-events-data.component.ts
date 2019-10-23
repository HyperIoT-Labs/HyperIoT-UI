import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService, HPacket, HProject, RulesService, Rule } from '@hyperiot/core';
import { ProjectDetailEntity } from '../project-detail-entity';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'hyt-packet-events-data',
  templateUrl: './packet-events-data.component.html',
  styleUrls: ['./packet-events-data.component.scss']
})
export class PacketEventsDataComponent extends ProjectDetailEntity implements OnDestroy {
  private routerSubscription: Subscription;
  private activatedRouteSubscription: Subscription;
  private packetId: number;

  packet: HPacket;
  project: HProject = {} as HProject;

  editMode = false;

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hPacketService: HpacketsService,
    private rulesService: RulesService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
    this.hideDelete = true; // hide 'Delete' button
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = +(activatedRoute.snapshot.params.packetId);
        this.loadData();
      }
    });
    this.activatedRouteSubscription = this.activatedRoute.params.subscribe(routeParams => {
      this.editMode = false;
      this.packetId = +(activatedRoute.snapshot.params.packetId);
      this.loadData();
    });
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  onAddClick() {
    this.editMode = true;
    this.resetForm();
  }

  loadData() {
    this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.packet = p;
      this.project = p.device.project;
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: p.id, type: 'packet-events'
      });
      // update rules summary list (on the right side)
      this.rulesService.findAllRuleByPacketId(this.packet.id).subscribe((rules: Rule[]) => {
        this.summaryList = {
          title: 'Events Data',
          list: rules.filter((i) => {
            if (i.type === Rule.TypeEnum.EVENT) {
              return { name: i.name, description: i.description, item: i };
            }
          }) as any
        };
      });
    });
  }
}
