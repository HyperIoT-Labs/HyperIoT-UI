import { Component, OnInit, ViewChild, Injectable, AfterViewInit } from '@angular/core';
import { HProject, HDevice, HPacket, Rule } from '@hyperiot/core';
import { Router, CanDeactivate } from '@angular/router';
import { Subject } from 'rxjs';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { ProjectDetailEntity, SubmitMethod } from '../project-detail/project-detail-entity';
import { ProjectDataComponent } from '../project-detail/project-data/project-data.component';
import { DeviceDataComponent } from '../project-detail/device-data/device-data.component';

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

  @ViewChild('stepper', { static: false }) stepper;

  currentForm: ProjectDetailEntity;

  @ViewChild('projectData', { static: false })
  projectData: ProjectDataComponent;

  @ViewChild('devicesData', { static: false })
  devicesData: DeviceDataComponent;

  @ViewChild('packetsData', { static: false })
  packetsData: DeviceDataComponent;

  currentProject: HProject;
  currentDevice: HDevice;
  hDevices: HDevice[] = [];
  hPackets: HPacket[] = [];
  enrichmentRules: Rule[] = [];
  eventRules: Rule[] = [];

  projectValidated: boolean = false;
  devicesValidated: boolean = false;
  packetsValidated: boolean = false;
  fieldsValidated: boolean = false;
  enrichmentValidated: boolean = false;
  statisticsValidated: boolean = false;
  eventsValidated: boolean = false;

  ovpOpen: boolean = false;
  finishOpen: boolean = false;

  constructor(
    private router: Router,
    private wizardService: ProjectWizardService
  ) { }

  ngOnInit() {
    this.wizardService.hDevices$.subscribe(
      (res: HDevice[]) => {
        this.hDevices = [...res];
        if (res && res.length != 0)
          this.devicesValidated = true;
        else
          this.devicesValidated = false;
      }
    );
    this.wizardService.hPackets$.subscribe(
      (res: HPacket[]) => {
        this.hPackets = [...res];
        if (res && res.length != 0) {
          this.packetsValidated = true;
          this.fieldsValidated = true;
        }
        else {
          this.packetsValidated = false;
          this.fieldsValidated = false;
        }
      }
    );
    this.wizardService.enrichmentRules$.subscribe(
      (res: Rule[]) => {
        this.enrichmentRules = [...res];
      }
    );
    this.wizardService.eventRules$.subscribe(
      (res: Rule[]) => {
        this.eventRules = [...res];
      }
    );
  }

  ngAfterViewInit() {
    setTimeout(() => {//TODO...setimeout 0 to avoid 'expression changed after view checked'
      this.currentForm = this.projectData;
    }, 0);
  }

  hintMessage = '';
  hintVisible = false;

  stepChanged(event) {
    console.log(event);

    //setting current form...
    switch (event.selectedIndex) {
      case 0: {
        this.currentForm = this.projectData;
        break;
      }
      case 1: {
        this.currentForm = this.devicesData;
        break;
      }
      case 2: {
        this.currentForm = this.packetsData;
        break;
      }
      case 3: {
        break;
      }
      case 4: {
        break;
      }
      case 5: {
        break;
      }
      case 6: {
        break;
      }
      default: {
        console.log("error");
      }
    }

    // this.wizardService.stepChanged(event.selectedIndex);
  }

  onSaveClick(e) {
    this.currentForm.save((ent) => {
      if (this.currentForm == this.projectData) {
        this.currentForm.submitMethod = SubmitMethod.Put;
        this.currentProject = ent;
      }
      else if (this.currentForm == this.devicesData) {
        this.hDevices.push(ent);
        this.hDevices = [...this.hDevices];
        this.currentForm.summaryList = {
          title: 'Devices',
          list: this.hDevices.filter((d) => {
            return { name: d.deviceName, description: d.description, item: d };
          }) as any
        };
      }
      else if (this.currentForm == this.packetsData) {
        this.hPackets.push(ent);
        this.hPackets = [...this.hPackets];
        this.currentForm.summaryList = {
          title: 'Packets',
          list: this.hPackets.filter((p) => {
            return { name: p.name, item: p };
          }) as any
        };
      }
    }, (error) => {
      // TODO: ...
    });
  }
  onEntityEvent(data: any) {
    switch (data.event) {
      case 'hint:show':
        this.showHintMessage(data.message);
        break;
      case 'hint:hide':
        this.hideHintMessage();
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


  onSummaryItemClick(event): void {
    console.log(event);
  }

  deviceChanged(event): void {
    this.currentDevice = event;
  }

  updateProject(proj: HProject) {
    if (proj) {
      this.currentProject = proj;
      this.projectValidated = true;
    }
    setTimeout(() => {
      this.stepper.next();
    }, 0);
  }

  openOptionModal() {
    this.ovpOpen = true;
    this.enrichmentValidated = true;
    this.statisticsValidated = true;
    this.eventsValidated = true;
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

  goToStepByIndex(index: number) {
    this.stepper.changeStep(index);
    this.closeOptionModal();
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

}
