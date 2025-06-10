import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { HPacket, HProject, Logger, LoggerService } from 'core';
import { EnrichmentType } from '../enrichment-type.enum';
import { DataSimulatorSettings } from 'widgets'

type Field = {
  label: string,
  field: string,
  disabled: boolean
};

type RuleConfiguration = {
  actionName: string,
  outputFieldId: number,
  outputFieldName: string,
  formula: string,

  /*
  {
  "actionName": "it.acsoftware.hyperiot.rule.service.actions.ComputeFieldRuleAction",
  "outputFieldId": 79,
  "outputFieldName": "temperatureDoubled",
  "formula": "temperature*2",
}
   */

  /**
   {
    "ruleDefinition": {
        "ruleDefinition": "\"77.78\" == \"1\"",
        "rulePrettyDefinition": "TempMonitor.temperature_data.temperature is equal to \"1\""
    },
    "rule-name": "TestVirtualSensor1",
    "rule-type": "it.acsoftware.hyperiot.rule.service.actions.VirtualSensorRuleAction",
    "active": "true",
    "rule-description": ""
    }
   */
}

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

  output = this.fb.group({
    outputFieldName: ['', Validators.required],
    fieldRule: ['', Validators.required],
    constants: this.fb.array([])
  });

  get fieldRule(): FormControl {
    return this.output.get('fieldRule') as FormControl;
  }

  get constants(): FormArray {
    return this.output.get('constants') as FormArray;
  }

  get outputFieldName(): FormControl {
    return this.output.get('outputFieldName') as FormControl;
  }

  placeholderAliasFormArray = this.fb.array([]);

  fieldOptions: Field[] = [];

  config: RuleConfiguration = {
    actionName: EnrichmentType.VIRTUAL_SENSOR_ENRICHMENT,
    formula: undefined,
    outputFieldId: undefined,
    outputFieldName: undefined
  };

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
        field: id.toString(),
        disabled: false
      }
    });

    this.addField();
    this.addConstant();

    //TEST
    this.output.valueChanges.subscribe((value) => {
      console.log(value);
    })

    this.placeholderAliasFormArray.valueChanges.subscribe((value) => {
      const selectedFieldList = value.filter(({ field }) => field);

      for (const element of this.fieldOptions) {
        element.disabled = selectedFieldList.some(({ field }) => field === element.field);
      }

      this.evaluateExpression(this.fieldRule.value);
    });

    this.constants.valueChanges.subscribe((constants) => {
      for (const element of this.constants.controls) {
        if (element.value.name) {
          element.addValidators(Validators.required)
        } else {
          element.removeValidators(Validators.required);
        }
      }

      this.evaluateExpression(this.fieldRule.value);
    });

    this.fieldRule.valueChanges.subscribe((expression: string) => {
      this.evaluateExpression(expression);
    });

    this.outputFieldName.valueChanges.subscribe((value) => {
      this.config.outputFieldName = value;
    });
  }

  private evaluateExpression(expression: string) {
    this.config.formula = undefined;

    if (this.placeholderAliasFormArray.length === 0) {
      this.fieldRule.setErrors({ 'incorrect': true });
      this.logger.debug('no placeholder was used');
      return;
    }

    expression = expression.replace(',', '.');
    try {
      for (const { name, value } of this.constants.value) {
        expression = expression.replace(new RegExp(name, 'gi'), value);
      }

      for (const { placeHolder, field } of this.placeholderAliasFormArray.value) {
        const escapePlaceholder = placeHolder.replace('$', '\\$');
        expression = expression.replace(new RegExp(escapePlaceholder, 'gi'), field);
      }

      for (const operator of DataSimulatorSettings.Utils.expressionOperators) {
        expression = expression.replace(operator.regex, operator.function);
      }

      if (expression) {
        new Function(`return ${expression}`)();
        this.logger.debug('expression is valid', expression);
        this.fieldRule.setErrors(null);

        this.config.formula = expression;
      } else {
        this.logger.debug('expression is empty');
        this.fieldRule.setErrors({ 'incorrect': true });
      }
    } catch (error) {
      this.logger.debug('expression is not valid', expression);
      this.fieldRule.setErrors({ 'incorrect': true });
    }
  }

  disableAdd(): boolean {
    return this.placeholderAliasFormArray.controls.length === this.fieldOptions.length || this.fieldOptions.every(({ disabled }) => disabled);
  }

  addField(): void {
    const counter = this.placeholderAliasFormArray.controls.length === 0 ? 1 : this.placeholderAliasFormArray.controls.length + 1;

    const row = this.fb.group({
      placeHolder: `$val${counter}`,
      field: ''
    })

    this.placeholderAliasFormArray.push(row);
  }

  deleteField(index: number): void {
    this.placeholderAliasFormArray.removeAt(index);

    if (this.placeholderAliasFormArray.controls.length > 0) {
      for (let counter = 0; counter < this.placeholderAliasFormArray.controls.length; counter++) {
        const element = this.placeholderAliasFormArray.controls[counter];
        element.get('placeHolder').setValue(`$val${counter + 1}`);
      }
    }
  }

  addConstant(): void {
    this.constants.push(this.fb.group({
      name: '',
      value: ''
    }));
  }

  deleteConstant(index: number): void {
    this.constants.removeAt(index);
  }

  isDirty(): boolean {
    return this.fieldRule.dirty;
  }

  isValid(): boolean {
    return this.fieldRule.valid;
  }

}
