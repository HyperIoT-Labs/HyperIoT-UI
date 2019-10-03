import { Component, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService, HPacket, HDevice, HProject, HdevicesService, Rule } from '@hyperiot/core';
import { FormBuilder } from '@angular/forms';
import { ProjectDetailEntity } from '../project-detail-entity';
import { PacketEnrichmentComponent } from '../../project-wizard/enrichment-step/packet-enrichment/packet-enrichment.component';

@Component({
  selector: 'hyt-packet-enrichments-data',
  templateUrl: './packet-enrichments-data.component.html',
  styleUrls: ['./packet-enrichments-data.component.scss']
})
export class PacketEnrichmentsDataComponent extends ProjectDetailEntity implements OnDestroy {
  @ViewChild(PacketEnrichmentComponent, {static: true}) enrichmentComponent: PacketEnrichmentComponent;
  private routerSubscription: Subscription;
  private activatedRouteSubscription: Subscription;
  private packetId: number;

  packet: HPacket;
  packetList: HPacket[] = [];
  deviceList: HDevice[] = [];
  project: HProject = {} as HProject;

  editMode = false;

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hPacketService: HpacketsService,
    private hDeviceService: HdevicesService,
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
    //this.form.removeControl('packetFieldComponent');
    //this.form.addControl('packetFieldComponent', this.enrichmentComponent.enrichmentForm);
    //this.enrichmentComponent.enrichmentForm.setParent(this.form);
    this.resetForm();
  }

  onRulesOutput(rule) {
    console.log('rulesOutput', rule);
    this.loadData();
  }

  loadData() {
    this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.packet = p;
      this.project = p.device.project;
      this.hDeviceService.findAllHDeviceByProjectId(this.project.id)
        .subscribe((dl: HDevice[]) => this.deviceList = dl);
      // TODO: data for temporary bound field [hPackets] that will be removed
      this.hPacketService.findAllHPacketByProjectId(this.project.id)
        .subscribe((pl: HPacket[]) => this.packetList = pl);
      this.treeView().focus({id: p.id, type: 'packet-enrichments'});
    });
  }
}
