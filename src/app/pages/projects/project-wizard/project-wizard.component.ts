import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { HProject, HDevice, HPacket, Rule, HdevicesService, HpacketsService } from '@hyperiot/core';
import { Subject, Observable, Observer } from 'rxjs';
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
import { PacketStatisticsFormComponent } from '../project-forms/packet-statistics-form/packet-statistics-form.component';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';
import { HytStepperComponent } from '@hyperiot/components/lib/hyt-stepper/hyt-stepper.component';
import { EntitiesService } from 'src/app/services/entities/entities.service';
import { WizardDeactivationModalComponent } from './wizard-deactivation-modal/wizard-deactivation-modal.component';
import { Option } from '@hyperiot/components';
import { ApplicationFormComponent } from '../project-forms/application-form/application-form.component';

@Component({
  selector: 'hyt-project-wizard',
  templateUrl: './project-wizard.component.html',
  styleUrls: ['./project-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectWizardComponent implements OnInit, AfterViewInit {

  @ViewChild('stepper', { static: false })
  stepper: HytStepperComponent;

  currentForm: ProjectFormEntity;

  @ViewChild('projectForm', { static: false })
  projectForm: ProjectFormComponent;

  @ViewChild('devicesForm', { static: false })
  devicesForm: DeviceFormComponent;

  @ViewChild('applicationsForm', { static: false })
  applicationsForm: ApplicationFormComponent;

  @ViewChild('deviceSelect', { static: false })
  deviceSelect: DeviceSelectComponent;

  @ViewChild('packetsForm', { static: false })
  packetsForm: PacketFormComponent;

  @ViewChild('fieldPacketSelect', { static: false })
  fieldPacketSelect: PacketSelectComponent;

  @ViewChild('fieldsForm', { static: false })
  fieldsForm: PacketFieldsFormComponent;

  @ViewChild('enrichmentPacketSelect', { static: false })
  enrichmentPacketSelect: PacketSelectComponent;

  @ViewChild('enrichmentForm', { static: false })
  enrichmentForm: PacketEnrichmentFormComponent;

  statisticsForm: PacketStatisticsFormComponent;

  @ViewChild('eventPacketSelect', { static: false })
  eventPacketSelect: PacketSelectComponent;

  @ViewChild('eventsForm', { static: false })
  eventsForm: PacketEventsFormComponent;

  @ViewChild('deactivationModal', { static: false })
  deactivationModal: WizardDeactivationModalComponent;

  panelIsVisible = true;

  currentProject: HProject;
  currentDevice: HDevice;
  hDevices: HDevice[] = [];
  hPackets: HPacket[] = [];
  enrichmentRules: Rule[] = [];
  eventRules: Rule[] = [];

  hintMessage = '';
  hintVisible = false;

  currentStepIndex = 0;

  finishData: { iconPath: string, type: string, entities: string[] }[] = [];

  canDeactivate$: Subject<boolean> = new Subject<boolean>();

  deactivateModal = false;

  optionModalViewed = false;

  constructor(
    private hDevicesService: HdevicesService,
    private hPacketsService: HpacketsService,
    private modalService: HytModalConfService,
    public entitiesService: EntitiesService
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {

    setTimeout(() => {// TODO...setimeout 0 to avoid 'expression changed after view checked'. Replace with chenge detection
      this.eventsForm.loadEmpty();
      this.enrichmentForm.loadEmpty();
      if (window.history.state.projectId) {
        this.projectForm.id = window.history.state.projectId;
        this.projectForm.load();
        this.optionModalViewed = true;
      }
      this.currentForm = this.projectForm;

    }, 0);

  }

  isWizardDirty() {
    return (
      this.projectForm.isDirty() ||
      ((this.selectedSource === 'application') ? this.applicationsForm.isDirty() : this.devicesForm.isDirty()) ||
      // this.devicesForm.isDirty() ||
      this.packetsForm.isDirty() ||
      this.fieldsForm.isDirty() ||
      this.enrichmentForm.isDirty() ||
      // this.statisticsForm.isDirty() ||
      this.eventsForm.isDirty()
    );
  }

  canDeactivate(com: ProjectWizardComponent) {
    if (this.isWizardDirty()) {
      return this.openDeactivationModal();
    }
    return true;
  }

  stepChanged(event) {
    this.currentStepIndex = event.selectedIndex;
    // setting current form...
    switch (event.selectedIndex) {
      case 0: {
        this.currentForm = this.projectForm;
        break;
      }
      case 1: {
        (this.selectedSource === 'application') ?
          this.currentForm = this.applicationsForm :
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
        this.currentForm = this.statisticsForm;
        break;
      }
      case 6: {
        this.currentForm = this.eventsForm;
        this.eventPacketSelect.autoSelect();
        break;
      }
      default: {
        console.log('error');
      }
    }

  }

  updateList(ent: any, entityList: any[]): any[] {
    const fin = entityList.find(x => x.id === ent.id);
    if (fin) {
      const en = entityList.find(x => x.id === ent.id);
      entityList[entityList.indexOf(en)] = ent;
    } else {
      entityList.push(ent);
    }
    return entityList;
  }

  deleteFromList(entId: number, entityList: any[]) {
    for (let k = 0; k < entityList.length; k++) {
      if (entityList[k].id === entId) {
        entityList.splice(k, 1);
      }
    }
    return entityList;
  }

  updateDeviceTable() {
    if (this.selectedSource === 'application') {
      this.applicationsForm.summaryList = {
        title: this.entitiesService.device.displayListName,
        list: this.hDevices.map((d) => {
          return { name: d.deviceName, description: d.description, data: d };
        }) as SummaryListItem[]
      };
    } else {
      this.devicesForm.summaryList = {
        title: this.entitiesService.device.displayListName,
        list: this.hDevices.map((d) => {
          return { name: d.deviceName, description: d.description, data: d };
        }) as SummaryListItem[]
      };
    }
  }

  updatePacketTable() {
    this.packetsForm.summaryList = {
      title: this.entitiesService.packet.displayListName,
      list: this.hPackets.map((p) => {
        return { name: p.name, description: p.trafficPlan, data: p };
      }) as SummaryListItem[]
    };
  }

  onSaveClick(e) {
    this.currentForm.save((ent, isNew) => {

      if (this.currentForm instanceof ProjectFormComponent) {
        this.currentProject = ent;
      } else if (this.currentForm instanceof DeviceFormComponent || this.currentForm instanceof ApplicationFormComponent) {
        this.currentForm.loadEmpty();
        this.hDevices = [...this.updateList(ent, this.hDevices)];
        this.updateDeviceTable();
      } else if (this.currentForm instanceof PacketFormComponent) {
        this.currentForm.loadEmpty();
        this.hPackets = [...this.updateList(ent, this.hPackets)];
        this.deviceSelect.unfreezeSelection();
        this.updatePacketTable();
      } else if (this.currentForm instanceof PacketEnrichmentFormComponent) {
        this.enrichmentRules = [...this.updateList(ent, this.enrichmentRules)];
        this.currentForm.loadEmpty();
      } else if (this.currentForm instanceof PacketEventsFormComponent) {
        this.eventRules = [...this.updateList(ent, this.eventRules)];
        this.currentForm.loadEmpty();
      }

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
        this.getDevices();
        this.getPackets();
        break;
    }
  }

  showHintMessage(message: string): void {
    this.hintMessage = message;
    this.hintVisible = true;
  }
  hideHintMessage(): void {
    this.hintVisible = false;
  }

  menuAction(event): void {
    switch (event.action) {
      case 'edit':
        if (this.currentForm instanceof PacketFormComponent) {
          this.deviceSelect.selectSpecific(event.item.data.device.id);
          this.deviceSelect.freezeSelection();
        }
        this.currentForm.edit(event.item.data);
        break;
      case 'duplicate':
        if (this.currentForm instanceof PacketFormComponent) {
          this.deviceSelect.unfreezeSelection();
          this.deviceSelect.selectSpecific(event.item.data.device.id);
        }
        this.currentForm.clone(event.item.data);
        break;
      case 'delete':
        if (this.currentForm instanceof PacketFormComponent) {
          this.deviceSelect.selectSpecific(event.item.data.device.id);
          this.deviceSelect.freezeSelection();
        }
        this.currentForm.edit(event.item.data, this.currentForm.openDeleteDialog((del) => {
          if (this.currentForm instanceof DeviceFormComponent || this.currentForm instanceof ApplicationFormComponent) {
            this.hDevices = [...this.deleteFromList(event.item.data.id, this.hDevices)];
            this.getPackets();
            this.updateDeviceTable();
          } else if (this.currentForm instanceof PacketFormComponent) {
            this.hPackets = [...this.deleteFromList(event.item.data.id, this.hPackets)];
            this.updatePacketTable();
            this.deviceSelect.unfreezeSelection();
          } else if (this.currentForm instanceof PacketEnrichmentFormComponent) {
            this.enrichmentRules = [...this.deleteFromList(event.item.data.id, this.enrichmentRules)];
          } else if (this.currentForm instanceof PacketEventsFormComponent) {
            this.eventRules = [...this.deleteFromList(event.item.data.id, this.eventRules)];
          }
          this.currentForm.loadEmpty();
        }));
        break;
      case 'add':
        if (this.currentForm instanceof PacketFormComponent) {
          this.deviceSelect.unfreezeSelection();
          this.deviceSelect.autoSelect();
        }
        this.currentForm.loadEmpty();
        break;
    }
  }

  deviceChanged(event): void {
    this.currentDevice = event;
  }

  fieldPacketChanged(event): void {
    if (event) {
      this.fieldsForm.loadData(event.id);
    }
  }

  enrichmentPacketChanged(event): void {
    if (event) {
      this.enrichmentForm.loadData(event.id);
      this.enrichmentForm.loadEmpty();
    }
  }

  eventPacketChanged(event): void {
    if (event) {
      this.eventsForm.loadData(event.id);
      this.eventsForm.loadEmpty();
    }
  }

  openDeactivationModal(): Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.modalService.open('hyt-wizard-deactivation-modal');
      this.deactivationModal.modalClose.subscribe(
        res => observer.next(res)
      );
    });
  }

  openOptionModal() {
    this.modalService.open('hyt-wizard-options-modal');
    this.optionModalViewed = true;
  }

  optionsModalClosed(event: { action: string, data: any }) {
    switch (event.action) {
      case 'goToStep': {
        this.stepper.changeStep(event.data);
        break;
      }
      case 'goToFinish': {
        this.openFinishModal();
        break;
      }
    }
  }

  openFinishModal() {
    this.finishData = [];
    this.finishData.push({
      iconPath: this.entitiesService.project.icon,
      type: this.entitiesService.project.displayListName,
      entities: [this.currentProject.name]
    });
    this.finishData.push({
      iconPath: this.entitiesService.device.icon,
      type: this.entitiesService.device.displayListName,
      entities: this.hDevices.map(d => d.deviceName)
    });
    this.finishData.push({
      iconPath: this.entitiesService.packet.icon,
      type: this.entitiesService.packet.displayListName,
      entities: this.hPackets.map(p => p.name)
    });
    this.finishData.push({
      iconPath: this.entitiesService.enrichment.icon,
      type: this.entitiesService.enrichment.displayListName,
      entities: this.enrichmentRules.map(e => e.name)
    });
    this.finishData.push({
      iconPath: this.entitiesService.event.icon,
      type: this.entitiesService.event.displayListName,
      entities: this.eventRules.map(e => e.name)
    });
    this.modalService.open('hyt-wizard-report-modal');
  }

  // Deactivation logic
  deactivate(cd: boolean): void {
    this.deactivateModal = false;
    this.canDeactivate$.next(cd);
  }

  // TODO... in service
  getDevices(): void {
    this.hDevicesService.findAllHDeviceByProjectId(this.currentProject.id).subscribe(
      (res: HDevice[]) => {
        this.hDevices = res;
        this.updateDeviceTable();
      }
    );
  }
  // TODO... in service
  getPackets(): void {
    this.hPacketsService.findAllHPacketByProjectId(this.currentProject.id).subscribe(
      (res: HPacket[]) => {
        this.hPackets = res;
        this.updatePacketTable();
      }
    );
  }

  isNextDisabled(): boolean {
    switch (this.currentStepIndex) {
      case 0: {
        return !this.currentProject;
        break;
      }
      case 1: {
        return this.hDevices.length === 0;
        break;
      }
      case 2: {
        return this.hPackets.length === 0;
        break;
      }
      default: {
        return false;
      }
    }
  }

  showCancel(): boolean {
    return this.currentForm instanceof PacketFieldsFormComponent;
  }

  togglePanel() {
    this.panelIsVisible = !this.panelIsVisible;
  }

  sourceOptions: Option[] = [
    { value: 'application', label: 'application', checked: true },
    { value: 'device', label: 'device' }
  ];

  selectedSource = 'application';

  sourceChanged(value) {
    this.selectedSource = value;
    if (this.selectedSource === 'application') {
      //TODO find better way to wait form recreation
      setTimeout(() => {
        this.currentForm = this.applicationsForm;
        this.updateDeviceTable();
      }, 0);
    } else {
      setTimeout(() => {
        this.currentForm = this.devicesForm;
        this.updateDeviceTable();
      }, 0);
    }
  }

  getDirty(index: number): boolean {
    switch (index) {
      case 0: {
        return (this.projectForm) ? this.projectForm.isDirty() : false;
        break;
      }
      case 1: {
        if (this.selectedSource === 'application') {
          return (this.applicationsForm) ? this.applicationsForm.isDirty() : false;
        } else {
          return (this.devicesForm) ? this.devicesForm.isDirty() : false;
        }
        break;
      }
      case 2: {
        return (this.packetsForm) ? this.packetsForm.isDirty() : false;
        break;
      }
      case 3: {
        return (this.fieldsForm) ? this.fieldsForm.isDirty() : false;
        break;
      }
      case 4: {
        return (this.enrichmentForm && this.enrichmentForm.editMode) ? this.enrichmentForm.isDirty() : false;
        break;
      }
      case 5: {
        return false;
        break;
      }
      case 6: {
        return (this.eventsForm && this.eventsForm.editMode) ? this.eventsForm.isDirty() : false;
        break;
      }
      default: {
        return false;
      }
    }
  }

}
