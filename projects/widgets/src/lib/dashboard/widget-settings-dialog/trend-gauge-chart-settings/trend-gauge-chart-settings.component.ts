import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectOption } from 'components';
import { Observable } from 'rxjs';
import { PacketSelectComponent } from '../packet-select/packet-select.component';
import { ConfigModel, Step, WidgetConfig } from '../../../base/base-widget/model/widget.model';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'hyperiot-trend-gauge-chart-settings',
  templateUrl: './trend-gauge-chart-settings.component.html',
  styleUrls: ['./trend-gauge-chart-settings.component.scss']
})
export class TrendGaugeChartSettingsComponent implements OnInit, OnDestroy {

  @ViewChild(PacketSelectComponent, { static: true })
  packetSelect: PacketSelectComponent;

  @Input() modalApply: Observable<any>;
  @Input() widget: WidgetConfig;

  readonly range = {
    min: -1,
    max: 1,
    step: 0.1
  } as const;

  subscription: any;
  selectedFields = [];

  gaugeForm: FormGroup;

  get stepList(): FormArray {
    return this.gaugeForm.get('stepList') as FormArray;
  }

  get title(): FormGroup {
    return this.gaugeForm.get('title') as FormGroup;
  }

  private defaultConfig: Pick<ConfigModel, 'textColor' | 'bgColor' | 'title' | 'steps'> = {
    textColor: '#275691',
    bgColor: 'bright',
    title: {
      text: 'Trend Gauge Chart',
      fontSize: 16,
    },
    steps: [
      {
        color: '#fe2739',
        range: [this.range.min, -0.5]
      },
      {
        color: '#febf58',
        range: [-0.5, -0.3]
      },
      {
        color: '#91cf52',
        range: [-0.3, 0.3]
      },
      {
        color: '#febf58',
        range: [0.3, 0.5]
      },
      {
        color: '#fe2739',
        range: [0.5, this.range.max]
      },
    ]
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

  }

  ngOnInit(): void {
    if (!this.widget.config) {
      this.widget.config = {};
      Object.assign(this.widget.config, this.defaultConfig);
    }

    const { text, fontSize } = this.widget.config.title;
    this.gaugeForm = this.fb.group({
      title: this.fb.group({
        text: [text, Validators.required],
        fontSize: [
          fontSize, [
            Validators.required,
            Validators.min(10),
            Validators.max(25)
          ]
        ]
      }),
      stepList: this.fb.array([]),
    });

    this.widget.config.steps.forEach(({ range: [start, stop], color }) => {
      this.stepList.push(this.fb.group({
        start: [start, Validators.required],
        stop: [stop, Validators.required],
        color: [color, Validators.required]
      }));
    })

    this.subscription = this.modalApply.subscribe((event) => {
      if (event === 'apply') {
        this.apply();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  apply(): void {
    const steps: Step[] = (this.stepList.value as []).map(({ start, stop, color }) => {
      return {
        range: [start, stop],
        color
      }
    });

    this.widget.config.steps = steps;

    const { text, fontSize } = this.title.value;
    this.widget.config.title = { text, fontSize };

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
