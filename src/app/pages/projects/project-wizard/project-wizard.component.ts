import { Component, OnInit, ViewChild, Injectable, AfterViewInit } from '@angular/core';
import { HProject, HDevice, HPacket, Rule, HdevicesClientModule } from '@hyperiot/core';
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
    setTimeout(() => {
      this.currentForm = this.projectData;
    }, 0);
  }

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
    console.log('saveClick', e);
    this.currentForm.save((ent) => {
      if (this.currentForm == this.projectData){
        this.currentForm.submitMethod = SubmitMethod.Put;
        this.currentProject = ent;
      }
      else if (this.currentForm == this.devicesData){
        this.hDevices.push(ent);
        this.hDevices = [...this.hDevices];
      } 
      else if (this.currentForm == this.packetsData){
        this.hPackets.push(ent);
        this.hPackets = [...this.hPackets];
      }
      console.log('entity saved', ent);
    }, (error) => {
      // TODO: ...
    });
  }
  onEntityEvent(data: any) {
    console.log(data);
    switch (data.event) {
      case 'hint:show':
        console.log('should show hint', data.message);
        break;
      case 'hint:hide':
        console.log('should hide hint');
        break;
    }
  }

  deviceChanged(event): void {
    console.log(event);
    this.currentDevice = event
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
