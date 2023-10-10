import {
  Component,
  ViewChild,
  ElementRef,
  Injector,
  ChangeDetectorRef,
  Input,
  AfterViewInit,
  OnInit,
  AfterContentInit, AfterViewChecked
} from '@angular/core';

import { Subject, PartialObserver } from 'rxjs';

import { AlgorithmsService, Algorithm } from 'core';

import { LoadingStatusEnum } from 'src/app/pages/algorithms/algorithm-forms/algorithm-form-entity';

import { Option, SelectOption } from 'components';
import {MachineLearningFormEntity} from "../machinelearning-form-entity";
import {MLAlgorithmConfig, MlAlgorithmsModel} from "../../models/ml.model";

@Component({
  selector: 'hyt-machinelearning-info-form',
  templateUrl: './machinelearning-info-form.component.html',
  styleUrls: ['./machinelearning-info-form.component.scss'],
})
export class MachineLearningInfoFormComponent extends MachineLearningFormEntity implements AfterViewInit,OnInit, AfterViewChecked {

  algorithm: Algorithm;

  sourceMLOptions: Option[] = [
    {
      value: "choose",
      label: "Choose an existing script",
    },
    {
      value: "upload",
      label: "Upload a new python script"
    }
  ];

  scriptTypes: Option[] = [
    {
      value: "all",
      label: "All",
      checked: true,
    },
    {
      value: "ml",
      label: "Machine Learning",
    },
    {
      value: "dl",
      label: "Deep Learning"
    }
  ];

  paramMLOptions: MLAlgorithmConfig[] = [];

  readonly paramMLOptionsDefault: MLAlgorithmConfig[] = [
    {
      type: "slider",
      min : 0,
      max : 2,
      default: 1,
      steps: 0.5,
      label: "Learning Rate"
    },
    {
      type: "slider",
      min : 0,
      max : 10,
      default: 5,
      steps: 1,
      label: "Early Stop"
    },
    {
      type: "radio",
      choices: [
        { value: "gradient",
          label: "GRADIENT",
          checked: true,
        },
        { value: "nan_gradient",
          label: "NaN GRADIENT"
        },
        { value: "stochastic",
          label: "Stochastic"
        }
      ],
      label: "Solver",
    },
    {
      type: "radio",
      choices: [
        { value: "mse",
          label: "MEAN SQUARED ERROR",
          checked: true,
        },
        { value: "bce",
          label: "BINARY CROSSENTROPY"
        },
        { value: "cce",
          label: "CATEGORICAL CROSSENTROPY"
        }
      ],
      label: "Loss",
    }
  ];

  selectedScriptType = "";
  selectedMLSource = "";
  errMsg = "";

  sourceMLChanged(value) {

    this.selectedMLSource = value;
    // *** MOCK ***
    this.algorithmMLOptions = [
      { value: 'KNN', label: 'K-NN' },
      { value: 'Naive Bayes', label: 'Naive Bayes' },
      { value: 'SVM', label: 'Support Vector Machine' },
      { value: 'ACNet', label: 'AC-Net' },
      { value: 'MLP', label: 'Multi Layer Perceptron' },
      { value: 'CNN', label: 'Convolutional Neural Network' },
    ]
    // ***** FINE MOCK *****
  }

  scriptTypeChanged(value) {
    this.selectedScriptType = value;
  }

  // *** PYFILE ***
  nameOfPyFile = "";
  pyToUpload = null;
  showMLconfig = false;

  changeOldScript(script){
    //DA SISTEMARE
    this.showMLconfig = true;
  }

  cancel(): void {
    this.load();
  }

  // NB: Qui poi occorrerà fare una chiamata per inizializzare
  algorithmMLOptions: SelectOption[] = [
    { value: 'KNN', label: 'K-NN' },
    { value: 'Naive Bayes', label: 'Naive Bayes' },
    { value: 'SVM', label: 'Support Vector Machine' },
  ];

  configMLOptions: Option[] = [
    {
      value: "default",
      label: "DEFAULT",
      checked: true,
    },
    { value: "passive",
      label: "PASSIVE"
    },
    { value: "aggressive",
    label: "AGGRESSIVE"
    },
    { value: "custom",
    label: "CUSTOM"
    },
  ];

  selectedConfigMLName = "default";

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
    super(injector,cdr);
    this.formTemplateId = 'algorithm-info-form';
    this.longDefinition = this.entitiesService.algorithm.longDefinition;
    this.formTitle = this.entitiesService.algorithm.formTitle;
    this.icon = this.entitiesService.algorithm.icon;
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.setParamMLOptionsDefault();
  }

  ngOnInit() {
    this.currentAlgorithmSubject.subscribe(this.algorithmObserver);
  }

  ngAfterViewInit() {
    this.loadEmpty();
    this.cdr.detectChanges();
  }

  ngAfterViewChecked(): void {
    this.initSliderController();
  }

  configMLChanged(value) {
    switch (value) {
      case "aggressive":
        this.paramMLOptions.filter(el => el.type === 'slider')[0].default = 1.5;
        this.paramMLOptions.filter(el => el.type === 'slider')[1].default = 2;
        this.paramMLOptions.filter(el => el.type === 'radio')[0].choices
          .map(ch => {
            if (ch.value === "nan_gradient") {
              ch.checked = true;
            } else {
              ch.checked = false;
            }
            return ch;
          });
        this.paramMLOptions.filter(el => el.type === 'radio')[1].choices
          .map(ch => {
            if (ch.value === "mse") {
              ch.checked = true;
            } else {
              ch.checked = false;
            }
            return ch;
          });
        break;
      case "passive":
        this.paramMLOptions.filter(el => el.type === 'slider')[0].default = 0.5;
        this.paramMLOptions.filter(el => el.type === 'slider')[1].default = 6;
        this.paramMLOptions.filter(el => el.type === 'radio')[0].choices
          .map(ch => {
            if (ch.value === "gradient") {
              ch.checked = true;
            } else {
              ch.checked = false;
            }
            return ch;
          });
        this.paramMLOptions.filter(el => el.type === 'radio')[1].choices
          .map(ch => {
            if (ch.value === "mse") {
              ch.checked = true;
            } else {
              ch.checked = false;
            }
            return ch;
          });
        break;
      default:
        this.setParamMLOptionsDefault();

    }
    this.selectedConfigMLName = value;
    this.initSliderController();
  }

  setParamMLOptionsDefault(): void {
    this.paramMLOptions = JSON.parse(JSON.stringify(this.paramMLOptionsDefault));
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

  initSliderController() {
    let idSlider = 0;
    this.paramMLOptions.filter(el => {
      if (el.type === "slider") {
        this.setSliderTooltip(+el.default, +el.max, idSlider);
        idSlider++;
      }
    })
    this.cdr.detectChanges();
  }

  load() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.cdr.detectChanges();
    /******* VALUE LOADING OVERLAY *******/
    this.divHeight = this.overlayHeight.nativeElement.clientHeight;
    /******* END VALUE LOADING OVERLAY *******/

    this.entity = this.algorithm;

    // Carico configurazione file python (caso: FILE PY caricato)
    if (this.entity.algorithmFileName && this.entity.algorithmFileName.includes(".py")){
      this.nameOfPyFile = this.entity.algorithmFileName;
      this.selectedMLSource = 'upload';

      const mlCustomConfig: MlAlgorithmsModel = <MlAlgorithmsModel>JSON.parse(<string>JSON.parse(this.entity.baseConfig)?.customConfig);
      this.paramMLOptions = mlCustomConfig?.algorithmConfig;

      this.configMLOptions.map(cfg => {
        if (cfg.value === mlCustomConfig.algorithmConfigName) {
          cfg.checked = true;
        } else {
          cfg.checked = false;
        }
      })

      // Ci può essere un modo più furbo di farlo
      this.sourceMLOptions = [
        {
          value: "choose",
          label: "Choose an existing script",
        },
        {
          value: "upload",
          label: "Upload a new python script",
          checked:true
        }
      ];

      this.showMLconfig = true;
      this.initSliderController();
    }

    // TO DO: carico configurazione file python (caso: algoritmo scelto dalla select)
    else if (this.entity.algorithmFileName && !this.entity.algorithmFileName.includes(".py")){
      this.selectedMLSource = 'choose';
      this.showMLconfig = true;

      // Ci può essere un modo più furbo di farlo pt.2
        this.sourceMLOptions = [
          {
            value: "choose",
            label: "Choose an existing script",
            checked:true
          },
          {
            value: "upload",
            label: "Upload a new python script"
          }
        ];
    }

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
    const baseConfig = JSON.stringify(p.baseConfig);
    let baseConfigObject = undefined;
    Array.isArray(p.baseConfig) ? baseConfigObject = JSON.parse(baseConfig)[0] : baseConfigObject = JSON.parse(baseConfig);
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

    /**
   * Function used to simulate click on choose file
   */
    clickChooseLabel(){
      //this.btnChooseIsDisabled = true;
      const inputChooseFile = document.getElementById('mlAlgorithmFileName');
      inputChooseFile.click();
      //setTimeout(() => this.btnChooseIsDisabled = false, 600);

      //Leggo le risposte dal BE e decido se mostrare le config
      this.showMLconfig = true;

    }

    isJarName(): string {
        return "";
    }

    resetTitleSelected() {
      this.pyToUpload = null;
      //this.form.controls.mlAlgorithmFileName.setValue('');
      //this.form.controls.mlAlgorithmFileName.updateValueAndValidity();
      this.nameOfPyFile = "";
      this.cdr.detectChanges();
    }

    async handleFileInput(files: FileList) {

      if(files.length > 0) {
        // Setto file uploaded
        this.pyToUpload = files.item(0);
        this.form.value['mlAlgorithmFileName'] = files[0].name;
        this.nameOfPyFile = files[0].name;

        // Check sintassi file uplodato
        const file = this.pyToUpload;
        const text = await file.text();
        let check = this.checkPythonFile(text);

        // reset se va male
        if (!check){
          this.resetTitleSelected();
          //TO DO: se abbiamo reset serve un messaggio di errore:
          this.errMsg = "Sintax error in your uploaded file. Check your file and try again!";
        }
        else{
          this.errMsg = "";
        }

      }else{
        this.form.value['mlAlgorithmFileName'] = '';
      }
      this.cdr.detectChanges();

    }

    checkPythonFile(text: string){

      //Primo check
      let flag_1 = text.includes("PARAMCONFIG");

      // Secondo check
      var count_1 = text.split("(").length - 1;
      var count_2 = text.split(")").length - 1;
      let flag_2 = count_1 == count_2;

      //Ultimo check -> deve essere un file python con SPARK
      let flag_3 = text.includes("SparkSession.builder.master");

      return flag_1 && flag_2 && flag_3;
    }

  setSliderAlgValue(value: string, i: number) {
    this.paramMLOptions[i].default = +value;
  }

  setRadioAlgValue(value: string, i: number) {
    this.paramMLOptions[i].choices.map(ch => ch.checked = false);
    this.paramMLOptions[i].choices.map(ch => {
      if (ch.value === value) {
        ch.checked = true;
      }
      return ch;
    })
  }

  protected readonly HTMLInputElement = HTMLInputElement;

  setSliderTooltip(value: string|number, max: number, idx: number) {
    const element = document.getElementById('slider-value-' + idx);
    const sourceElement = document.getElementById('slider-' + idx);
    if(element && sourceElement) {
      element.style.visibility = 'visible';
      element.style.left = ((sourceElement.getBoundingClientRect().width / max) * +value) + 'px';
      this.paramMLOptions[idx].default = +value;
    }
  }
}
