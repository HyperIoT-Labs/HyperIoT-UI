import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectOption } from 'components';
import { Observable } from 'rxjs';
import { PacketSelectComponent } from '../packet-select/packet-select.component';
import { WidgetConfig } from '../../../base/base-widget/model/widget.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'hyperiot-trend-gauge-chart-settings',
  templateUrl: './trend-gauge-chart-settings.component.html',
  styleUrls: ['./trend-gauge-chart-settings.component.scss']
})
export class TrendGaugeChartSettingsComponent implements OnInit, OnDestroy {

  @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;

  @Input() modalApply: Observable<any>;
  @Input() widget: WidgetConfig;

  readonly range = {
    min: -1,
    max: 1,
    step: 0.1
  } as const;

  subscription: any;
  selectedFields = [];

  stepForm: FormGroup;

  get stepList(): FormArray {
    return this.stepForm.get('stepList') as FormArray;
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

  constructor(
    private fb: FormBuilder
  ) {
    this.stepForm = this.fb.group({
      stepList: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    if (this.widget.config === null) {
      this.widget.config = {};
      Object.assign(this.widget.config, this.defaultConfig);
    }

    if (true) {
      [
        {
          "start": -1,
          "stop": -0.9,
          "color": "#701515"
        },
        {
          "start": -0.9,
          "stop": -0.8,
          "color": "#3a9613"
        },
        {
          "start": -0.8,
          "stop": -0.7,
          "color": "#7d6789"
        },
        {
          "start": -0.7,
          "stop": 0.7,
          "color": "#64d10a"
        }
      ].forEach(({ start, stop, color }) => {
        this.stepList.push(this.fb.group({
          start: [start, Validators.required],
          stop: [stop, Validators.required],
          color: [color, Validators.required]
        }))
      })
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  apply(): void {
    this.packetSelect.apply();
  }

  onSelectedFieldsChange(fields: any): void {
    this.selectedFields = fields;
  }

  addStep(): void {
    const stepCount = this.stepList.length;
    const start = stepCount === 0
      ? this.range.min
      : Number(this.stepList.at(stepCount - 1).get('stop')?.value);

    if (start >= 1) {
      return;
    }

    const stop = Number((start + this.range.step).toFixed(1));

    this.stepList.push(this.fb.group({
      start: [start, Validators.required],
      stop: [stop, Validators.required],
      color: [null, Validators.required]
    }));
  }

  deleteStep(index: number): void {
    this.stepList.removeAt(index);
  }

}
