import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HytModalService } from 'components';
import { HytStepperComponent } from 'components';
import { Algorithm, AlgorithmIOField, AlgorithmsService } from 'core';
import { Subject } from 'rxjs';
import { EntitiesService } from 'src/app/services/entities/entities.service';
import { AlgorithmFormEntity, LoadingStatusEnum } from '../algorithm-forms/algorithm-form-entity';
import { AlgorithmInfoFormComponent } from '../algorithm-forms/algorithm-info-form/algorithm-info-form.component';
import { AlgorithmJarFormComponent } from '../algorithm-forms/algorithm-jar-form/algorithm-jar-form.component';
import { InputFieldsFormComponent } from '../algorithm-forms/input-fields-form/input-fields-form.component';
import { OutputFieldsFormComponent } from '../algorithm-forms/output-fields-form/output-fields-form.component';
import { AlgorithmWizardReportModalComponent } from './algorithm-wizard-report-modal/algorithm-wizard-report-modal.component';


@Component({
  selector: 'hyt-algorithm-wizard',
  templateUrl: './algorithm-wizard.component.html',
  styleUrls: ['./algorithm-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlgorithmWizardComponent implements OnInit {

  algorithmId: number;
  currentAlgorithm: Algorithm;
  currentAlgorithmSubject: Subject<Algorithm> = new Subject<Algorithm>();
  currentForm: AlgorithmFormEntity;
  currentInput: AlgorithmIOField[] = [];
  currentOutput: AlgorithmIOField[] = [];
  currentStepIndex = 0;

  finishData: { iconPath: string, type: string, entities: string[] }[] = [];
  hintMessage = '';
  hintVisible = false;
  optionModalViewed = false;
  panelIsVisible = true;

  @ViewChild('algorithmInfoForm')
  algorithmInfoForm: AlgorithmInfoFormComponent;

  @ViewChild('inputFieldsForm')
  inputFieldsForm: InputFieldsFormComponent;

  @ViewChild('outputFieldsForm')
  outputFieldsForm: OutputFieldsFormComponent;

  @ViewChild('algorithmJarForm')
  algorithmJarForm: AlgorithmJarFormComponent;

  @ViewChild('stepper')
  stepper: HytStepperComponent;

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
        this.currentInput = JSON.parse(this.currentAlgorithm.baseConfig).input;
        this.currentOutput = JSON.parse(this.currentAlgorithm.baseConfig).output;
        this.currentAlgorithmSubject.next(this.currentAlgorithm);
      });
    }
    else {
      this.algorithmInfoForm.loadingStatus = LoadingStatusEnum.Ready;
    }
    this.currentForm = this.algorithmInfoForm;
  }

  getDirty(index: number): boolean {
    switch (index) {
      case 0: {
        return (this.algorithmInfoForm) ? this.algorithmInfoForm.isDirty() : false;
      }
      case 1: {
        return (this.inputFieldsForm) ? this.inputFieldsForm.isDirty() : false;
      }
      case 2: {
        return (this.outputFieldsForm) ? this.outputFieldsForm.isDirty() : false;
      }
      case 3: {
        return (this.algorithmJarForm) ? this.algorithmJarForm.isDirty() : false;
      }
      default: {
        return false;
      }
    }
  }

  hideHintMessage(): void {
    this.hintVisible = false;
  }

  isNextDisabled(): boolean {
    switch (this.currentStepIndex) {
      case 0: {
        return !this.currentAlgorithm;
      }
      case 1: {
        return this.currentInput.length === 0;
      }
      case 2: {
        return this.currentOutput.length === 0;
      }
      case 3: {
        return !this.currentAlgorithm.algorithmFileName || this.currentAlgorithm.algorithmFileName.length === 0;
      }
    }
  }

  isWizardDirty() {
    return this.algorithmInfoForm.isDirty();
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
        this.currentInput = JSON.parse(this.currentAlgorithm.baseConfig).input;
        this.currentOutput = JSON.parse(this.currentAlgorithm.baseConfig).output;
        this.currentAlgorithmSubject.next(this.currentAlgorithm);
        break;
    }
  }

  onSaveClick(e) {
    this.currentForm.save((ent, isNew) => {
      if (this.currentForm instanceof AlgorithmInfoFormComponent) {
        this.currentAlgorithm = ent;
        // wait for step 0 validation (next cicle)
        this.cd.detectChanges();
        this.stepper.next();
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
    return this.currentForm instanceof InputFieldsFormComponent || this.currentForm instanceof OutputFieldsFormComponent;
  }

  showHintMessage(message: string): void {
    this.hintMessage = message;
    this.hintVisible = true;
  }

  stepChanged(event) {
    this.currentStepIndex = event.selectedIndex;
    // setting current form...
    switch (event.selectedIndex) {
      case 0: {
        this.currentForm = this.algorithmInfoForm;
        break;
      }
      case 1: {
        this.currentForm = this.inputFieldsForm;
        break;
      }
      case 2: {
        this.currentForm = this.outputFieldsForm;
        break;
      }
      case 3: {
        this.currentForm = this.algorithmJarForm;
        break;
      }
      default: {
        console.log('error');
      }
    }
  }

  togglePanel() {
    this.panelIsVisible = !this.panelIsVisible;
  }

}
