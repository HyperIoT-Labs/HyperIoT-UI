import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { HpacketsService, HPacket, HPacketField } from '@hyperiot/core';
import { ProjectDetailEntity, LoadingStatusEnum } from '../project-detail-entity';

import { Option } from '@hyperiot/components';
import { Node, HytTreeViewEditableComponent } from '@hyperiot/components/lib/hyt-tree-view-editable/hyt-tree-view-editable.component';
import { PacketFieldService } from 'src/app/services/projectWizard/packet-field.service';

@Component({
  selector: 'hyt-packet-fields-data',
  templateUrl: './packet-fields-data.component.html',
  styleUrls: ['./packet-fields-data.component.scss']
})
export class PacketFieldsDataComponent extends ProjectDetailEntity implements OnDestroy {
  @ViewChild('treeViewFields', { static: false }) treeViewFields: HytTreeViewEditableComponent;
  private routerSubscription: Subscription;
  private activatedRouteSubscription: Subscription;
  private packetId: number;

  fieldMultiplicityOptions: Option[] = Object.keys(HPacketField.MultiplicityEnum)
    .map((k) => ({ label: k, value: k }));

  fieldTypeOptions: Option[] = Object.keys(HPacketField.TypeEnum)
    .map((k) => ({ label: k, value: k }));

  packet: HPacket = {} as HPacket;
  packetList: HPacket[] = [];
  currentField: HPacketField;

  packetTree = [] as Node[];

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
    this.hideDelete = true;
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = +(activatedRoute.snapshot.params.packetId);
        this.loadData();
      }
    });
    this.activatedRouteSubscription = this.activatedRoute.params.subscribe(routeParams => {
      this.currentField = null;
      this.packetId = +(activatedRoute.snapshot.params.packetId);
      this.loadData();
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
    this.activatedRouteSubscription.unsubscribe();
  }

  // ProjectDetailEntity interface
  save(successCallback, errorCallback) {
    this.savePacket(successCallback, errorCallback);
  }
  delete(successCallback, errorCallback) {
    // TODO: ....
  }

  // fields treeview methods

  addField(e) {
    console.log('addField', e);
  }

  removeField(e) {
    console.log('removeField', e);
  }

  editField(e) {
    this.currentField = e.data;
    this.loadFormData();
  }

  cancelField(e) {
    console.log('cancelField', e);
  }

  private loadData() {
    this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.packet = p;
      // TODO: data for temporary bound field [hPackets] that will be removed
      this.hPacketService.findAllHPacketByProjectId(this.packet.device.project.id)
        .subscribe((pl: HPacket[]) => this.packetList = pl);
      this.treeView().focus({ id: p.id, type: 'packet-fields' });
      // -------------------------------------------------------
      this.hPacketService.findTreeFields(this.packetId).subscribe(res => {
        this.packetTree = res.map((pf: HPacketField) => ({
          data: pf,
          root: false,
          name: pf.name,
          lom: pf.multiplicity,
          type: pf.type,
          children: null
        }));
        if (this.treeViewFields) {
          this.treeViewFields.refresh(this.packetTree, this.packet.name);
        }
        this.resetForm();
      });
    });
  }

  private savePacket(successCallback, errorCallback) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();
    this.currentField.name = this.form.get('fieldName').value;
    this.currentField.description = this.form.get('fieldDescription').value;
    this.currentField.multiplicity = this.form.get('fieldMultiplicity').value;
    this.currentField.type = this.form.get('fieldType').value;
    this.hPacketService.saveHPacket(this.packet).subscribe((res) => {
      this.packet = res;
      this.resetForm();
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    }, (err) => {
      this.setErrors(err);
      errorCallback && errorCallback(err);
    });
  }

  private loadFormData() {
    this.form.get('fieldName').setValue(this.currentField.name);
    this.form.get('fieldDescription').setValue(this.currentField.description);
    this.form.get('fieldMultiplicity').setValue(this.currentField.multiplicity);
    this.form.get('fieldType').setValue(this.currentField.type);
    this.resetForm();
  }

}
