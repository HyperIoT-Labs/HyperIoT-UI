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

  stepForm: FormGroup;

  get stepList(): FormArray {
    return this.stepForm.get('step') as FormArray;
  }

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

  constructor(private fb: FormBuilder) {
    this.stepForm = this.fb.group({
      step: this.fb.array([]),
    });
  }

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

    this.stepForm.valueChanges.subscribe((value) => {
      console.log(value);
    });

    this.addStep();
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

  canAddStep(step: Step) {
    // return this.stepList.length === 0 || this.stepList[this.stepList.length - 1].range[1] < step.range[0];
  }

  addStep() {
    const stepCount = this.stepList.length;
    const start = stepCount === 0
      ? -1
      : +this.stepList.at(stepCount - 1).get('stop')?.value;

    if (start >= 1) {
      // alert('Le step non possono superare il range di -1 a 1.');
      return;
    }

    this.stepList.push(this.fb.group({
      start: [start, Validators.required],
      stop: [(start + 0.1).toFixed(1), Validators.required],
      color: [null, Validators.required]
    }));
  }

  deleteStep(index: number) {
    this.stepList.removeAt(index);
  }

}
