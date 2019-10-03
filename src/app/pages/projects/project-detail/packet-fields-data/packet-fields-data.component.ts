import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService, HPacket } from '@hyperiot/core';
import { ProjectDetailEntity } from '../project-detail-entity';
import { FormBuilder, FormControl } from '@angular/forms';
import { PacketFieldComponent } from '../../project-wizard/fields-step/packet-field/packet-field.component';

@Component({
  selector: 'hyt-packet-fields-data',
  templateUrl: './packet-fields-data.component.html',
  styleUrls: ['./packet-fields-data.component.scss']
})
export class PacketFieldsDataComponent extends ProjectDetailEntity implements OnDestroy, AfterViewInit {
  @ViewChild(PacketFieldComponent, {static: true}) packetFieldComponent: PacketFieldComponent;
  private routerSubscription: Subscription;
  private packetId: number;

  packet: HPacket = {} as HPacket;
  packetList: HPacket[] = [];

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hPacketService: HpacketsService,
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
  }

  ngAfterViewInit() {
    // the following timeout is to prevent validatio check errors due to value changes
    setTimeout(() => {
      this.form.addControl('packetFieldComponent', this.packetFieldComponent.fieldForm);
      this.packetFieldComponent.fieldForm.setParent(this.form);
      this.resetForm();
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  loadData() {
    this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.packet = p;
      // TODO: data for temporary bound field [hPackets] that will be removed
      this.hPacketService.findAllHPacketByProjectId(this.packet.device.project.id)
        .subscribe((pl: HPacket[]) => this.packetList = pl);
      this.resetForm();
      this.treeView().focus({id: p.id, type: 'packet-fields'});
    });
  }

  packetsOutputChanged($event) {
    console.log($event);
  }
}
