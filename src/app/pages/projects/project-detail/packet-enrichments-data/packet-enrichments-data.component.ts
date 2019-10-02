import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService, HPacket, HDevice, HProject, HdevicesService } from '@hyperiot/core';
import { FormBuilder } from '@angular/forms';
import { ProjectDetailEntity } from '../project-detail-entity';
import { EnrichmentStepComponent } from '../../project-wizard/enrichment-step/enrichment-step.component';

@Component({
  selector: 'hyt-packet-enrichments-data',
  templateUrl: './packet-enrichments-data.component.html',
  styleUrls: ['./packet-enrichments-data.component.scss']
})
export class PacketEnrichmentsDataComponent extends ProjectDetailEntity implements OnDestroy, AfterViewInit {
  @ViewChild(EnrichmentStepComponent, {static: true}) enrichmentComponent: EnrichmentStepComponent;
  private routerSubscription: Subscription;
  private packetId: number;

  packet: HPacket;
  packetList: HPacket[] = [];
  deviceList: HDevice[] = [];
  project: HProject = {} as HProject;

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
        // TODO: load data
        this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
          this.packet = p;
          this.project = p.device.project;
          this.hDeviceService.findAllHDeviceByProjectId(this.project.id)
            .subscribe((dl: HDevice[]) => this.deviceList = dl);
          // TODO: data for temporary bound field [hPackets] that will be removed
          this.hPacketService.findAllHPacketByProjectId(this.project.id)
            .subscribe((pl: HPacket[]) => this.packetList = pl);
        });
      }
    });
  }

  ngAfterViewInit() {
    // the following timeout is to prevent validatio check errors due to value changes
    setTimeout(() => {
      this.form.addControl('packetFieldComponent', this.enrichmentComponent.enrichmentForm);
      this.enrichmentComponent.enrichmentForm.setParent(this.form);
      this.resetForm();
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

}
