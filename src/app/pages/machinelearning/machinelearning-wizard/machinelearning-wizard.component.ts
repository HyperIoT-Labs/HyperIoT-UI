import { Component, OnInit, ViewChild, ViewEncapsulation,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {HytModalService} from 'components';
import { Algorithm, AlgorithmIOField, AlgorithmsService } from 'core';
import { Subject } from 'rxjs';
import { EntitiesService } from 'src/app/services/entities/entities.service';

import { LoadingStatusEnum } from 'src/app/pages/algorithms/algorithm-forms/algorithm-form-entity';
import { AlgorithmWizardReportModalComponent } from 'src/app/pages/algorithms/algorithm-wizard/algorithm-wizard-report-modal/algorithm-wizard-report-modal.component';
import {
  MachineLearningInfoFormComponent
} from "../machinelearning-forms/machinelearning-info-form/machinelearning-info-form.component";
import {MlAlgorithmsModel} from "../models/ml.model";
import {MachineLearningFormEntity} from "../machinelearning-forms/machinelearning-form-entity";

@Component({
  selector: 'hyt-machinelearning-wizard',
  templateUrl: './machinelearning-wizard.component.html',
  styleUrls: ['./machinelearning-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MachineLearningWizardComponent implements OnInit {

  algorithmId: number;
  currentAlgorithm: Algorithm;
  currentAlgorithmSubject: Subject<Algorithm> = new Subject<Algorithm>();
  currentForm: MachineLearningFormEntity;
  currentCustomConfig: any[] = [];

  finishData: { iconPath: string, type: string, entities: string[] }[] = [];
  hintMessage = '';
  hintVisible = false;
  panelIsVisible = true;

  @ViewChild('algorithmInfoForm')
  algorithmInfoForm: MachineLearningInfoFormComponent;

  constructor(
      private algorithmsService: AlgorithmsService,
      public entitiesService: EntitiesService,
      private hytModalService: HytModalService,
      private route: ActivatedRoute,
      private cd: ChangeDetectorRef) {
    this.route.params.subscribe(routeParams => {
      this.algorithmId = +(route.snapshot.params.id);
    });
   }

  ngOnInit() {
    this.cd.detectChanges();
    if (this.algorithmId) {
      this.algorithmsService.findAlgorithm(this.algorithmId).subscribe((a: Algorithm) => {
        this.currentAlgorithm = a;
        this.currentCustomConfig = JSON.parse(this.currentAlgorithm.baseConfig).customConfig;
        this.currentAlgorithmSubject.next(this.currentAlgorithm);
      });
    }
    else {
      this.algorithmInfoForm.loadingStatus = LoadingStatusEnum.Ready;
    }

    this.currentForm = this.algorithmInfoForm;
    this.currentForm.entity.type = "MACHINE_LEARNING"; //Obbligatorio in questa area
  }

  hideHintMessage(): void {
    this.hintVisible = false;
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
      case 'pw:algorithm-updated':
        this.currentAlgorithm = data.algorithm;
        this.currentAlgorithmSubject.next(this.currentAlgorithm);
        break;
    }
  }

  onSaveClick(e) {
    // Salvo nome del file python associato
    if (this.currentForm['pyToUpload']) {this.currentForm.entity.algorithmFileName = this.currentForm['pyToUpload'].name;}

    interface mlAlghorithm {
      input: any[],
      output: any[],
      customConfig: any[]
    }

    // Salvo configurazioni ML -> occorre capire come passare le config (Error 500: cannot deserialize value of type 'it.acsoftware.hyperiot.algorithm.model.Algorithm')
    const formML: MlAlgorithmsModel = {algorithmConfigName: this.currentForm.selectedConfigMLName , algorithmConfig: this.currentForm["paramMLOptions"]};
    const baseConfig = [{
      input: [],
      output: [],
      customConfig: JSON.stringify(formML)
    }];

    this.currentForm.entity.baseConfig = baseConfig;

    const responseHandler = (res) => {
      console.log('responseHandler: ', res);
      // this.currentForm.entity  = res;
/*      this.resetForm();
      this.entityEvent.emit({
        event: 'pw:algorithm-updated',
        algorithm: res
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);*/
    };
    console.log('CurrentForm: ', this.currentForm);

    this.currentForm.save((ent, isNew) => {
      if (this.currentForm instanceof MachineLearningFormEntity) {
        this.currentAlgorithm = ent;

        this.algorithmsService.saveAlgorithm(this.currentAlgorithm);
        if (this.currentForm.pyToUpload) {
          const updateFileObserver = {
            next: (x: number) => responseHandler,
            error: (err: Error) => console.log('Error:', err)
          };
          this.algorithmsService.updateAlgorithmFile(this.currentAlgorithm.id, this.currentAlgorithm.mainClassname, this.currentForm.pyToUpload)
            .subscribe(updateFileObserver);
        }
        // wait for step 0 validation (next cicle)
        this.cd.detectChanges();
      }
    }, (error) => {
        // TODO: ...
    });
  }

  openFinishModal() {
    this.cd.detectChanges();
    const modalRef = this.hytModalService.open(AlgorithmWizardReportModalComponent, this.finishData);
  }

  showCancel(): boolean {
    return this.currentForm instanceof MachineLearningInfoFormComponent;
  }

  showHintMessage(message: string): void {
    this.hintMessage = message;
    this.hintVisible = true;
  }

  togglePanel() {
    this.panelIsVisible = !this.panelIsVisible;
  }

}
