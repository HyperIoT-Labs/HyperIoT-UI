import { Component, OnDestroy, ViewChild, ElementRef, Injector, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription, Observable } from 'rxjs';

import { HpacketsService, HPacket, HPacketField } from '@hyperiot/core';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';

import { Option } from '@hyperiot/components';
import { Node, HytTreeViewEditableComponent } from '@hyperiot/components/lib/hyt-tree-view-editable/hyt-tree-view-editable.component';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { UnitConversionService } from 'src/app/services/unit-conversion.service';
import { HytSelectComponent } from '@hyperiot/components/lib/hyt-select/hyt-select.component';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'hyt-packet-fields-form',
  templateUrl: './packet-fields-form.component.html',
  styleUrls: ['./packet-fields-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PacketFieldsFormComponent extends ProjectFormEntity implements OnDestroy {
  @ViewChild('treeViewFields', { static: false }) treeViewFields: HytTreeViewEditableComponent;
  @ViewChild('measureSelect', { static: false }) measureSelect: HytSelectComponent;
  private routerSubscription: Subscription;
  private activatedRouteSubscription: Subscription;

  entityFormMap = {
    'hpacketfield-name': {
      field: 'name',
      default: null
    },
    'hpacketfield-description': {
      field: 'description',
      default: null
    },
    'hpacketfield-type': {
      field: 'type',
      default: null
    },
    'hpacketfield-multiplicity': {
      field: 'multiplicity',
      default: 'SINGLE'
    },
    'hpacketfield-unit': {
      field: 'unit',
      default: null
    }
  };

  packetId: number;

  fieldMultiplicityOptions: Option[] = Object.keys(HPacketField.MultiplicityEnum)
    .map((k) => ({ label: k, value: k }));

  fieldTypeOptions: Option[] = Object.keys(HPacketField.TypeEnum)
    .map((k) => ({ label: k, value: k }));

  packet: HPacket = {} as HPacket;
  packetList: HPacket[] = [];
  currentField: HPacketField;

  packetTree = [] as Node[];

  formTitle = 'Packet Fields';

  measureOptions = UnitConversionService.measurements.map((m) => ({
    label: m.type,
    value: m.type
  }));
  unitOptions = [];

  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hPacketService: HpacketsService,
    private unitConversionService: UnitConversionService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private i18n: I18n
  ) {
    super(injector, i18n, formView);
    this.longDefinition = this.entitiesService.field.longDefinition;
    this.formTitle = this.entitiesService.field.formTitle;
    this.icon = this.entitiesService.field.icon;
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
      if (this.packetId) {
        this.loadData();
      }
    });
    // add empty option to measurement type select
    this.measureOptions.unshift({ label: '(not specified)', value: '' });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
    this.activatedRouteSubscription.unsubscribe();
  }

  onMeasurementTypeChange(measurementType) {
    const measurementUnit = UnitConversionService.measurements.find((m) => m.type === measurementType);
    this.unitOptions = [{ label: '(not specified)', value: '' }];
    if (measurementUnit) {
      this.unitOptions.push(...measurementUnit.list
        .map((u) => ({
          label: `${u.plural} (${u.abbr})`,
          value: u.abbr
        })).sort((a, b) => a.label < b.label ? -1 : 1)
      );
    }
    this.form.patchValue({ 'hpacketfield-unit': '' });
  }

  // ProjectDetailEntity interface
  save(successCallback, errorCallback) {
    this.savePacket(successCallback, errorCallback);
  }
  /*
  delete(successCallback, errorCallback) {
    // TODO: ....
  }
  */
  cancel() {
    this.resetForm();
    this.showCancel = false;
    this.currentField = null;
  }

  // fields treeview methods

  addField(e) {
    this.currentField = this.newEntity() as HPacketField;
    this.currentField.parentField = e.data;
    this.showCancel = true;
    this.loadFormData();
  }

  removeField(e) {
    this.openDelete(e.data.id);
  }

  editField(e) {
    const proceedWithEdit = () => {
      this.currentField = e.data;
      this.showCancel = true;
      this.loadFormData();
    };
    const canDeactivate = this.canDeactivate();
    if (typeof canDeactivate === 'boolean' && canDeactivate === true) {
      proceedWithEdit();
    } else {
      (canDeactivate as Observable<any>).subscribe((res) => {
        if (res) {
          proceedWithEdit();
        }
      });
    }
  }

  loadData(packetId?: number) {
    if (packetId) { this.packetId = packetId; }
    this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.packet = p;
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: p.id, type: 'packet-fields'
      });
      this.hPacketService.findTreeFields(this.packetId).subscribe(res => {
        this.packetTree = this.createFieldsTree(res);
        if (this.treeViewFields) {
          this.treeViewFields.refresh(this.packetTree, this.packet.name);
        }
        this.resetForm();
      });
    });
  }

  private createFieldsTree(nodes: any) {
    if (nodes == null) return null;
    return nodes.map((pf: HPacketField) => ({
      data: pf,
      root: false,
      name: pf.name,
      lom: pf.multiplicity,
      type: pf.type,
      children: (pf.type === HPacketField.TypeEnum.OBJECT)
        ? this.createFieldsTree(pf.innerFields) : null
    }));
  }

  private savePacket(successCallback, errorCallback) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();
    this.currentField.name = this.form.get('hpacketfield-name').value;
    this.currentField.description = this.form.get('hpacketfield-description').value;
    this.currentField.multiplicity = this.form.get('hpacketfield-multiplicity').value;
    this.currentField.type = this.form.get('hpacketfield-type').value;
    this.currentField.unit = this.form.get('hpacketfield-unit').value;
    let saveObservable: Observable<any>;
    if (this.currentField.id > 0) {
      saveObservable = this.hPacketService
        .updateHPacketField(this.packet.id, this.currentField);
    } else {
      saveObservable = this.hPacketService
        .addHPacketField(this.packet.id, this.currentField);
    }
    saveObservable.subscribe((res) => {
      this.currentField = null; // closes the field editing form
      this.form.reset();
      this.showCancel = false;
      this.loadData(); // refresh data and treeview
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res, this.packetId);
    }, (err) => {
      this.setErrors(err);
      errorCallback && errorCallback(err);
    });
  }

  private loadFormData() {
    this.form.get('hpacketfield-name').setValue(this.currentField.name);
    this.form.get('hpacketfield-description').setValue(this.currentField.description);
    this.form.get('hpacketfield-multiplicity').setValue(this.currentField.multiplicity);
    this.form.get('hpacketfield-type').setValue(this.currentField.type);
    // load and populate measurement unit fields
    if (this.currentField.unit) {
      const measurementUnit = this.unitConversionService.convert().describe(this.currentField.unit);
      this.measureSelect.formControl.setValue(measurementUnit.measure);
      this.onMeasurementTypeChange(measurementUnit.measure);
      this.form.get('hpacketfield-unit').setValue(this.currentField.unit);
    } else {
      this.measureSelect.formControl.setValue('');
      this.onMeasurementTypeChange('');
    }
    // reset form
    this.resetForm();
  }

  private openDelete(fieldId: number) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { title: 'Delete item?', message: 'This operation cannot be undone.' }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        if (this.currentField && this.currentField.id === fieldId) {
          this.currentField = null;
        }
        this.hPacketService.deleteHPacketField(fieldId).subscribe(
          res => {
            this.loadData();
            this.entityEvent.emit({
              event: 'field:delete',
              packet: this.packetId
            });
          },
          err => {
            console.log(err);
            // TODO: report error!
          }
        );
      }
    });
  }

}
