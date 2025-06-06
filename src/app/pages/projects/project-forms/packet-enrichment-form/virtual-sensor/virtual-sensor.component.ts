import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HPacket, HProject, Logger, LoggerService } from 'core';
import { EnrichmentType } from '../enrichment-type.enum';
import { DataSimulatorSettings } from 'widgets'

@Component({
  selector: 'hyt-virtual-sensor',
  templateUrl: './virtual-sensor.component.html',
  styleUrls: ['./virtual-sensor.component.scss']
})
export class VirtualSensorComponent implements OnInit {

  @Input()
  packet: HPacket;

  @Input()
  project: HProject;

  fieldRules = this.fb.control('');

  arrayForm = this.fb.array([]);

  fieldOptions = [];

  private _config;

  @Input()
  set config(cfg: any) {
    this._config = cfg;
    cfg.actionName = EnrichmentType.VIRTUAL_SENSOR_ENRICHMENT;
  }

  private logger: Logger;

  constructor(
    private fb: FormBuilder,
    private loggerService: LoggerService,
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(this.constructor.name);
  }

  ngOnInit(): void {
    this.fieldOptions = this.packet.fields.map(({ name, id }) => {
      return {
        label: name,
        value: id,
        disabled: false
      }
    });

    this.add();

    this.arrayForm.valueChanges.subscribe((value) => {
      const selectedFieldList = value.filter(({ field }) => field);

      for (const element of this.fieldOptions) {
        element.disabled = selectedFieldList.some(({ field }) => field === element.value);
      }
    });

    this.fieldRules.valueChanges.subscribe((expression: string) => {
      expression = expression.replace(',', '.');
      try {
        for (const operator of DataSimulatorSettings.Utils.expressionOperators) {
          expression = expression.replace(operator.regex, operator.function);
        }
        const result = eval(expression.replace(/\$val/g, '2'));
        this.logger.debug('expression is valid', expression.replace(/\$val/g, '2'), result);
        this.fieldRules.setErrors(null);
      } catch (error) {
        this.logger.debug('expression is not valid', expression.replace(/\$val/g, '2'));
        this.fieldRules.setErrors({ 'incorrect': true });
      }
    })
  }

  add(): void {
    const counter = this.arrayForm.controls.length === 0 ? 1 : this.arrayForm.controls.length + 1;

    const row = this.fb.group({
      placeHolder: `$val${counter}`,
      field: null
    })

    this.arrayForm.push(row);
  }

  deleteRow(index: number): void {
    this.arrayForm.removeAt(index);

    if (this.arrayForm.controls.length > 0) {
      for (let counter = 0; counter < this.arrayForm.controls.length; counter++) {
        const element = this.arrayForm.controls[counter];
        element.get('placeHolder').setValue(`$val${counter + 1}`);
      }
    }
  }


  isDirty(): boolean {
    return this.fieldRules.dirty;
  }

  isValid(): boolean {
    return this.fieldRules.valid;
  }

}
