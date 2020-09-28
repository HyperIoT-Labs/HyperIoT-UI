import { Component, ViewChild, ElementRef, Injector, ChangeDetectorRef, ViewEncapsulation, Input, AfterViewInit, OnInit } from '@angular/core';

import { Observable, Subject, PartialObserver } from 'rxjs';

import { Option } from '@hyperiot/components';

import { AlgorithmsService, Algorithm, AlgorithmInput } from '@hyperiot/core';

import { AlgorithmFormEntity, LoadingStatusEnum } from '../algorithm-form-entity';

@Component({
  selector: 'hyt-algorithm-info-form',
  templateUrl: './algorithm-info-form.component.html',
  styleUrls: ['./algorithm-info-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlgorithmInfoFormComponent extends AlgorithmFormEntity implements AfterViewInit, OnInit {

  algorithm: Algorithm;

  algorithmInputPacketsOptions: Option[] = [
    { value: 'packets.single', label: $localize`:@@HYT_algorithm_input_single_packet:One packet only`, checked: true },
    { value: 'packets.more', label: $localize`:@@HYT_algorithm_input_more_packets:More packets`}
  ];

  algorithmObserver: PartialObserver<Algorithm> = {
    next: res => {
      this.algorithm = res;
      this.load();
    }
  };

  divHeight: number;
  entity = {} as Algorithm;
  entityFormMap = {
    'algorithm-name': {
      field: 'name'
    },
    'algorithm-description': {
      field: 'description'
    }
  };
  showPreloader: boolean;

  @Input() currentAlgorithmSubject: Subject<Algorithm>;

  private overlayHeight: ElementRef;
  @ViewChild('overlayHeight') set content(content: ElementRef) {
    if (!content) {
      this.showPreloader = false;
      return;
    } else {
      this.showPreloader = true;
      this.overlayHeight = content;
    }
  }

  constructor(
    private algorithmsService: AlgorithmsService,
    injector: Injector,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
    this.formTemplateId = 'algorithm-info-form';
    this.longDefinition = this.entitiesService.algorithm.longDefinition;
    this.formTitle = this.entitiesService.algorithm.formTitle;
    this.icon = this.entitiesService.algorithm.icon;
    this.loadingStatus = LoadingStatusEnum.Loading;
  }

  ngOnInit() {
    this.currentAlgorithmSubject.subscribe(this.algorithmObserver);
  }

  ngAfterViewInit() {
    if (this.algorithm) {
      this.load();
    } else {
      this.loadEmpty();
    }
    this.cdr.detectChanges();
  }

  edit(algorithm?: Algorithm, readyCallback?) {
    const proceedWithEdit = () => {
      this.showCancel = true;
      this.editMode = true;
      super.edit(algorithm, () => {
        const baseConfig = JSON.parse(this.entity.baseConfig);
        if (baseConfig.input.multiplicity === AlgorithmInput.MultiplicityEnum.SINGLE) {
          this.form.get('algorithm-packets').setValue(this.algorithmInputPacketsOptions[0].value);
        } else {
          this.form.get('algorithm-packets').setValue(this.algorithmInputPacketsOptions[1].value);
        }
        if (readyCallback) {
          readyCallback();
        }
      });
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

  getCustomClass() {
    if (this.showPreloader) {
      if (this.divHeight > 353) { /* BIG */
        return 'loading-logo display-logo big-bg';
      }
      if (this.divHeight >= 293 && this.divHeight <= 352) { /* MEDIUM */
        return 'loading-logo display-logo medium-bg';
      }
      if (this.divHeight >= 233 && this.divHeight <= 292) { /* SMALL */
        return 'loading-logo display-logo small-bg';
      }
      if (this.divHeight >= 182 && this.divHeight <= 232) { /* X-SMALL */
        return 'loading-logo display-logo x-small-bg';
      }
      if (this.divHeight < 182) { /* X-SMALL */
        return '';
      }
    } else {
      return '';
    }
  }

  load() {
    this.loadingStatus = LoadingStatusEnum.Loading;

    /******* VALUE LOADING OVERLAY *******/

    setTimeout(() => {

      this.divHeight = this.overlayHeight.nativeElement.clientHeight;

    }, 0);

    this.cdr.detectChanges();

    /******* END VALUE LOADING OVERLAY *******/

    this.entity = this.algorithm;
    this.edit();
    this.loadingStatus = LoadingStatusEnum.Ready;
  }

  loadEmpty() {
    this.form.reset();
    this.entity = { ...this.entitiesService.algorithm.emptyModel };
    this.edit();
  }

  private saveAlgorithm(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();

    let p = this.entity;
    const baseConfigObject = JSON.parse(p.baseConfig);
    if (this.form.get('algorithm-packets').value === 'packets.single') {
      baseConfigObject.input.multiplicity = AlgorithmInput.MultiplicityEnum.SINGLE;
    }
    else {
      baseConfigObject.input.multiplicity = AlgorithmInput.MultiplicityEnum.ARRAY;
    }
    p.name = this.form.get('algorithm-name').value;
    p.description = this.form.get('algorithm-description').value;
    p.baseConfig = JSON.stringify(baseConfigObject);
    const wasNew = this.isNew();
    const responseHandler = (res) => {
      this.entity = p = res;
      this.resetForm();
      this.entityEvent.emit({
        event: 'pw:algorithm-updated',
        algorithm: res
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res, wasNew);
    };
    if (p.id) {
      this.algorithmsService.updateAlgorithm(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    } else {
      p.entityVersion = 1;
      this.algorithmsService.saveAlgorithm(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ message: $localize`:@@HYT_unavailable_algorithm_name:Unavailable algorithm name`, field: 'algorithm-name', invalidValue: '' }];
          this.form.get('algorithm-name').setErrors({
            validateInjectedError: {
              valid: false
            }
          });
          this.loadingStatus = LoadingStatusEnum.Ready;
          break;
        }
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
          super.setErrors(err);
          break;
        }
        default: {
          this.loadingStatus = LoadingStatusEnum.Error;
        }
      }
    } else {
      this.loadingStatus = LoadingStatusEnum.Error;
    }
  }

  // AlgorithmDetailEntity interface
  save(successCallback, errorCallback) {
    this.saveAlgorithm(successCallback, errorCallback);
  }

}
