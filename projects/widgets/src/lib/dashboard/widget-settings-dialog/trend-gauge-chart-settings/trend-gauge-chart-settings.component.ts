import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectOption } from 'components';
import { Observable } from 'rxjs';
import { PacketSelectComponent } from '../packet-select/packet-select.component';
import { WidgetConfig } from '../../../base/base-widget/model/widget.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

type Step = {
  range: [number, number],
  color: string
}

@Component({
  selector: 'hyperiot-trend-gauge-chart-settings',
  templateUrl: './trend-gauge-chart-settings.component.html',
  styleUrls: ['./trend-gauge-chart-settings.component.css']
})
export class TrendGaugeChartSettingsComponent implements OnInit, OnDestroy {

  @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;

  @Input() modalApply: Observable<any>;
  @Input() widget: WidgetConfig;

  newStep: Step | undefined;

  subscription: any;
  selectedFields = [];

  // stepList: Step[] = []

  // formGroup = this.fb.group({
  //   step: this.fb.group({
  //     range: this.fb.group({
  //       start: [null, Validators.required],
  //       stop: [null, Validators.required]
  //     }),
  //     color: [null, Validators.required]
  //   }),
  //   // stepsList: this.fb.array([])
  // });

  formGroup = this.fb.group({
    range: this.fb.group({
      start: [null, Validators.required],
      stop: [null, Validators.required]
    }),
    color: [null, Validators.required]
  }
  );

  stepsList = this.fb.array([])

  // get stepList(): FormArray {
  //   return this.formGroup.get('stepList') as FormArray;
  // }

  private defaultConfig = {
    textColor: '#275691',
    bgColor: 'bright'
  };

  bgColorOptions: SelectOption[] = [
    {
      value: 'bright',
      label: $localize`:@@HYT_widget_settings_bg_color_bright:Bright`
    },
    {
      value: 'dark',
      label: $localize`:@@HYT_widget_settings_bg_color_dark:Dark`
    }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    if (this.widget.config === null) {
      this.widget.config = {};
      Object.assign(this.widget.config, this.defaultConfig);
    }

    this.subscription = this.modalApply.subscribe((event) => {
      if (event === 'apply') {
        this.apply();
      }
    });


    this.formGroup.valueChanges.subscribe((value) => {
      console.log(value);      
    })
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  apply() {
    this.packetSelect.apply();
  }

  onSelectedFieldsChange(fields: any) {
    this.selectedFields = fields;
  }

  addStep(step: FormGroup) {
    this.stepsList.push(step);
  }

  // addStep(step: Step) {
  // this.stepList.push(step);

  // this.stepList.push(
  //   this.fb.group({
  //     range: this.fb.group({
  //       start: [null, Validators.required],
  //       stop: [null, Validators.required]
  //     }),
  //     color: [null, Validators.required]
  //   }),
  // )
  // }

  canAddStep(step: Step) {
    // return this.stepList.length === 0 || this.stepList[this.stepList.length - 1].range[1] < step.range[0];
  }

  deleteStep() {

  }

}
