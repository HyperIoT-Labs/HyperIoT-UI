import { Component, OnInit, ViewChild, Injectable, AfterViewInit } from '@angular/core';
import { HProject, HDevice, HPacket, Rule, HdevicesService, HpacketsService } from '@hyperiot/core';
import { Router, CanDeactivate } from '@angular/router';
import { Subject } from 'rxjs';
import { ProjectFormEntity } from '../project-forms/project-form-entity';
import { ProjectFormComponent } from '../project-forms/project-form/project-form.component';
import { DeviceFormComponent } from '../project-forms/device-form/device-form.component';
import { PacketFormComponent } from '../project-forms/packet-form/packet-form.component';
import { DeviceSelectComponent } from './device-select/device-select.component';
import { PacketFieldsFormComponent } from '../project-forms/packet-fields-form/packet-fields-form.component';
import { SummaryListItem } from '../project-detail/generic-summary-list/generic-summary-list.component';
import { PacketSelectComponent } from './packet-select/packet-select.component';
import { PacketEnrichmentFormComponent } from '../project-forms/packet-enrichment-form/packet-enrichment-form.component';
import { PacketEventsFormComponent } from '../project-forms/packet-events-form/packet-events-form.component';

@Injectable({
  providedIn: 'root',
})
export class ProjectWizardCanDeactivate implements CanDeactivate<ProjectWizardComponent>{
  canDeactivate(com: ProjectWizardComponent) {
    if (com.currentProject == null || com.finishOpen)
      return true;
    else {
      com.deactivateModal = true;
      return com.canDeactivate$;
    }
  }
}

@Component({
  selector: 'hyt-project-wizard',
  templateUrl: './project-wizard.component.html',
  styleUrls: ['./project-wizard.component.scss']
})
export class ProjectWizardComponent implements OnInit, AfterViewInit {

  @ViewChild('stepper', { static: false })
  stepper;

  currentForm: ProjectFormEntity;

  @ViewChild('projectForm', { static: false })
  projectForm: ProjectFormComponent;

  @ViewChild('devicesForm', { static: false })
  devicesForm: DeviceFormComponent;

  @ViewChild('packetsForm', { static: false })
  packetsForm: PacketFormComponent;

  @ViewChild('fieldPacketSelect', { static: false })
  fieldPacketSelect: PacketSelectComponent;

  @ViewChild('enrichmentPacketSelect', { static: false })
  enrichmentPacketSelect: PacketSelectComponent;

  @ViewChild('deviceSelect', { static: false })
  deviceSelect: DeviceSelectComponent;

  @ViewChild('fieldsForm', { static: false })
  fieldsForm: PacketFieldsFormComponent;

  @ViewChild('enrichmentForm', { static: false })
  enrichmentForm: PacketEnrichmentFormComponent;

  @ViewChild('eventsForm', { static: false })
  eventsForm: PacketEventsFormComponent;

  @ViewChild('eventPacketSelect', { static: false })
  eventPacketSelect: PacketSelectComponent;

  currentProject: HProject;
  currentDevice: HDevice;
  hDevices: HDevice[] = [];
  hPackets: HPacket[] = [];
  enrichmentRules: Rule[] = [];
  eventRules: Rule[] = [];

  packetInformationValidated: boolean = false;

  ovpOpen: boolean = false;
  finishOpen: boolean = false;

  constructor(
    private router: Router,
    private hDevicesService: HdevicesService,
    private hPacketsService: HpacketsService
  ) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    setTimeout(() => {//TODO...setimeout 0 to avoid 'expression changed after view checked'
    this.eventsForm.editMode = true;
    this.enrichmentForm.editMode = true;
    this.resetForms();
      if (window.history.state.projectId) {
        this.projectForm.id = window.history.state.projectId;
        this.projectForm.load();
      }
      this.currentForm = this.projectForm;
    }, 0);
  }

  resetForms(){
    //this.projectForm.edit();
    //this.devicesForm.edit();
    this.packetsForm.edit();
    //this.enrichmentForm.edit();
    //this.eventsForm.edit();
  }

  hintMessage = '';
  hintVisible = false;

  currentStepIndex: number = 0;

  stepChanged(event) {
    this.currentStepIndex = event.selectedIndex;
    //setting current form...
    switch (event.selectedIndex) {
      case 0: {
        this.currentForm = this.projectForm;
        break;
      }
      case 1: {
        this.currentForm = this.devicesForm;
        this.getDevices();
        break;
      }
      case 2: {
        this.currentForm = this.packetsForm;
        this.getPackets();
        break;
      }
      case 3: {
        this.currentForm = this.fieldsForm;
        this.fieldPacketSelect.autoSelect();
        break;
      }
      case 4: {
        this.currentForm = this.enrichmentForm;
        this.enrichmentPacketSelect.autoSelect();
        break;
      }
      case 5: {
        break;
      }
      case 6: {
        this.currentForm = this.eventsForm;
        this.eventPacketSelect.autoSelect();
        break;
      }
      default: {
        console.log("error");
      }
    }
    console.log(this.currentForm.isDirty())
    // if (!this.currentForm.isDirty())
    //   this.currentForm.edit();
    //this.wizardService.stepChanged(event.selectedIndex);
  }

  updateList(ent: any, entityList: any[]): any[] {
    let fin = entityList.find(x => x.id == ent.id);
    if (fin) {
      const en = entityList.find(x => x.id == ent.id);
      entityList[entityList.indexOf(en)] = ent;
    }
    else
      entityList.push(ent);
    return entityList;
  }

  deleteFromList(entId: number, entityList: any[]) {
    for (let k = 0; k < entityList.length; k++) {
      if (entityList[k].id == entId)
        entityList.splice(k, 1);
    }
    return entityList;
  }

  updateDeviceTable() {
    this.devicesForm.summaryList = {
      title: 'Devices',
      list: this.hDevices.map((d) => {
        return { name: d.deviceName, description: d.description, data: d };
      }) as SummaryListItem[]
    };
  }

  updatePacketTable() {
    this.packetsForm.summaryList = {
      title: 'Packets',
      list: this.hPackets.map((p) => {
        return { name: p.name, description: p.trafficPlan, data: p };
      }) as SummaryListItem[]
    };
  }

  onSaveClick(e) {
    this.currentForm.save((ent, isNew) => {

      if (this.currentForm == this.projectForm) {
        this.currentProject = ent;
      }

      else if (this.currentForm == this.devicesForm) {
        this.currentForm.cleanForm();
        this.hDevices = [...this.updateList(ent, this.hDevices)];
        this.updateDeviceTable();
      }

      else if (this.currentForm == this.packetsForm) {
        this.currentForm.cleanForm();
        this.hPackets = [...this.updateList(ent, this.hPackets)];
        this.updatePacketTable();
      }

      else if (this.currentForm == this.eventsForm || this.currentForm == this.enrichmentForm) {
        this.currentForm.cleanForm();
      }

      // this.currentForm.entity.id = null;

    }, (error) => {
      // TODO: ...
    });
  }
  onCancelClick(e) {
    this.currentForm.cancel();
  }
  onEntityEvent(data: any) {
    switch (data.event) {
      case 'hint:show':
        this.showHintMessage(data.message);
        break;
      case 'hint:hide':
        this.hideHintMessage();
        break;
      case 'pw:project-loaded':
        this.currentProject = data.project;
    }
  }

  showHintMessage(message: string): void {
    this.hintMessage = message;
    this.hintVisible = true;
  }
  hideHintMessage(): void {
    this.hintVisible = false;
  }

  onSummaryItemClick(event): void {
  }

  menuAction(event): void {
    console.log(event.item)
    switch (event.action) {
      case 'edit':
        if (this.currentForm == this.packetsForm)
          this.deviceSelect.selectSpecific(event.item.data.device.id);
        this.currentForm.edit(event.item.data);
        break;
      case 'duplicate':
        if (this.currentForm == this.packetsForm)
          this.deviceSelect.selectSpecific(event.item.data.device.id);
        this.currentForm.clone(event.item.data);
        break;
      case 'delete':
        console.log(this.currentForm.entity);
        this.currentForm.entity = event.item.data;
        this.currentForm.delete((del) => {

          if (this.currentForm == this.devicesForm) {
            this.hDevices = [...this.deleteFromList(event.item.data.id, this.hDevices)];
            this.updateDeviceTable();
          }

          else if (this.currentForm == this.packetsForm) {
            this.hPackets = [...this.deleteFromList(event.item.data.id, this.hPackets)];
            this.updatePacketTable();
          }

          this.currentForm.entity = {};

        }, (err) => {
          // TODO: ...
        });
        break;
    }
  }

  deviceChanged(event): void {
    this.currentDevice = event;
  }

  fieldCurrentPacketId: number;
  fieldPacketChanged(event): void {
    if (event) {
      this.fieldCurrentPacketId = event.id;
    }
  }

  enrichmentCurrentPacketId: HPacket;
  enrichmentPacketChanged(event): void {
    if (event) {
      this.enrichmentCurrentPacketId = event.id;
    }
  }

  eventCurrentPacketId: HPacket;
  eventPacketChanged(event): void {
    if (event) {
      this.eventCurrentPacketId = event.id;
    }
  }

  openOptionModal() {
    this.ovpOpen = true;
    this.packetInformationValidated = true;
  }

  closeOptionModal() {
    this.ovpOpen = false;
  }

  openFinishModal() {
    this.ovpOpen = false;
    this.finishOpen = true;
  }

  closeFinishModal() {
    this.finishOpen = false;
  }

  goToDashboard() {
    this.router.navigate(['/dashboards']);
  }

  goToProjectWizard() {
    this.router.navigate(['/projects']);
  }

  //Deactivation logic

  canDeactivate$: Subject<boolean> = new Subject<boolean>();

  deactivateModal: boolean = false;

  deactivate(cd: boolean): void {
    this.deactivateModal = false;
    this.canDeactivate$.next(cd);
  }

  //TODO... in service
  getDevices(): void {
    this.hDevicesService.findAllHDeviceByProjectId(this.currentProject.id).subscribe(
      (res: HDevice[]) => {
        this.hDevices = res;
        this.updateDeviceTable();
      }
    )
  }
  //TODO... in service
  getPackets(): void {
    this.hPacketsService.findAllHPacketByProjectId(this.currentProject.id).subscribe(
      (res: HPacket[]) => {
        this.hPackets = res;
        this.updatePacketTable();
      }
    )
  }

  isNextDisabled(): boolean {
    switch (this.currentStepIndex) {
      case 0: {
        return !this.currentProject;
        break;
      }
      case 1: {
        return this.hDevices.length == 0;
        break;
      }
      case 2: {
        return this.hPackets.length == 0;
        break;
      }
      default: {
        return false;
      }
    }
  }

  nextFn() {
    if (this.currentStepIndex == 3 && !this.packetInformationValidated)
      this.openOptionModal();
    else if (this.currentStepIndex == 6)
      this.openOptionModal();
    else
      this.stepper.next();
  }

}
