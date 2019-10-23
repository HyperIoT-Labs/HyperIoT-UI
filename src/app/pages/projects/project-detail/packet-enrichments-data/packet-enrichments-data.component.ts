import { Component, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService, HPacket, HDevice, HProject, Rule, RulesService } from '@hyperiot/core';
import { FormBuilder } from '@angular/forms';
import { ProjectDetailEntity } from '../project-detail-entity';
import { PacketEnrichmentComponent } from '../../project-wizard/enrichment-step/packet-enrichment/packet-enrichment.component';
import { SummaryList } from '../generic-summary-list/generic-summary-list.component';

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
  project: HProject = {} as HProject;

  editMode = false;

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private packetService: HpacketsService,
    private rulesService: RulesService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
    this.longDefinition = 'enrichment long definition';//@I18N@
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

  onRuleAdded(rule: Rule) {
    console.log('ruleAdded', rule);
    // refresh buond data
    this.loadData();
  }

  loadData() {
    this.summaryList = null;
    this.packetService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.project = p.device.project;
      //this.hDeviceService.findAllHDeviceByProjectId(this.project.id)
      //  .subscribe((dl: HDevice[]) => this.deviceList = dl);
      // TODO: data for temporary bound field [hPackets] that will be removed
      this.packetService.findAllHPacketByProjectId(this.project.id)
        .subscribe((pl: HPacket[]) => {
          this.packetList = pl;
          this.packet = p;
          // update rules summary list (on the right side)
          this.rulesService.findAllRuleByPacketId(this.packet.id).subscribe((rules: Rule[]) => {
            this.summaryList = {
              title: 'Enrichments Data',
              list: rules.filter((i) => {
                if (i.type === Rule.TypeEnum.ENRICHMENT) {
                  return { name: i.name, description: i.description, item: i };
                }
              }) as any
            };
          });
      });
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: p.id, type: 'packet-enrichments'
      });
    });
  }
}
