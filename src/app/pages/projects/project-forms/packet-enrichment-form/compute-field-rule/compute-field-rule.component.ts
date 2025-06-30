import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { HPacket, HPacketField, HpacketsService, HProject, Logger, LoggerService } from 'core';
import { EnrichmentType } from '../enrichment-type.enum';
import { DataSimulatorSettings } from 'widgets'
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

type Field = {
  field: Pick<HPacketField, 'id' | 'name'>;
  disabled: boolean
}

type Variable = {
  field: Pick<HPacketField, 'id' | 'name'>;
  placeHolder: string
}

type Constant = {
  name: string;
  value: number;
}

type RuleConfiguration = {
  actionName: string;
  outputFieldId: number;
  outputFieldName: string;
  formula: string;
  formulaRow: string;
  variables: Variable[];
  constants: Constant[];
}

@Component({
  selector: 'hyt-compute-field-rule',
  templateUrl: './compute-field-rule.component.html',
  styleUrls: ['./compute-field-rule.component.scss']
})
export class ComputeFieldRuleComponent implements OnInit {

  @Input()
  packet: HPacket;

  @Input()
  project: HProject;

  _config: RuleConfiguration | undefined;

  @Input()
  set config(cfg: RuleConfiguration | undefined) {
    this.initInputOutputFieldsSelection();

    this._config = cfg;
    const { actionName, constants, formulaRow, variables, outputFieldId } = this._config;
    if (actionName) {
      this.formulaFormControl.patchValue(formulaRow);

      this.variablesFormArray.clear();

      for (const { field, placeHolder } of variables) {
        const selectFieldValue = this.fieldOptions.find(({ field: { id } }) => field.id === id).field;

        this.variablesFormArray.push(
          this.fb.group({
            placeHolder: [placeHolder, Validators.required],
            field: [selectFieldValue, Validators.required]
          })
        );
      }

      if (constants.length > 0) {
        for (const constant of constants) {
          this.addConstant(constant);
        }
      } else {
        this.addConstant();
      }

      this.hPacketService.getHPacketField([outputFieldId])
        .subscribe({
          next: (res) => {
            if (res && res.length > 0) {
              this.outputPacketFieldGroup.patchValue(res[0]);
            }
          },
          error: (err) => {

          }
        });
    } else {
      this._config.actionName = EnrichmentType.COMPUTE_FIELD_RULE_ACTION;
      this._config.formula = undefined;
      this._config.outputFieldId = undefined;
      this._config.outputFieldName = undefined;
      this._config.variables = [];
      this._config.constants = [];

      this.addVariable();
      this.addConstant();
    }
  };

  get config(): RuleConfiguration | undefined {
    return this._config;
  }

  readonly output = this.fb.group({
    formula: ['', Validators.required],
    constants: this.fb.array([])
  });

  readonly outputPacketFieldGroup = this.fb.group({
    id: [],
    name: ['', Validators.required],
    description: ['output', Validators.required],
    multiplicity: ['', Validators.required],
    type: ['', Validators.required]
  });

  get formulaFormControl(): FormControl {
    return this.output.get('formula') as FormControl;
  }

  get constantList(): FormArray {
    return this.output.get('constants') as FormArray;
  }

  readonly variablesFormArray = this.fb.array([]);

  fieldOptions: Field[] = [];
  outputPacketFieldList: HPacketField[] = [];

  readonly packetFieldDetail = {
    multiplicity: HPacketField.MultiplicityEnum,
    type: HPacketField.TypeEnum,
  } as const;

  newHPackedField: Pick<HPacketField, 'name' | 'multiplicity' | 'type'>;

  private readonly logger: Logger;

  enableEditPackedField = false;

  errorCreationOutputField: string;

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService,
    private loggerService: LoggerService,
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(this.constructor.name);
  }

  ngOnInit(): void {
    this.outputPacketFieldGroup.valueChanges
      .subscribe(({ id, name }) => {
        if (id) {
          this.config.outputFieldId = id;
        }

        if (name) {
          this.config.outputFieldName = name;
        }
      })

    this.variablesFormArray.valueChanges
      .subscribe((variableList: Variable[]) => {
        const selectedFieldList = variableList.filter(({ field }) => field?.id);

        this.fieldOptions.forEach((fieldOption) => {
          fieldOption.disabled = selectedFieldList.some(({ field }) => field.id === fieldOption.field.id);
        });

        this.config.variables = variableList.map(({ field, placeHolder }) => {
          return {
            field,
            placeHolder
          };
        });

        this.evaluateFormula(this.formulaFormControl.value);
      });

    this.constantList.valueChanges
      .subscribe(() => {
        this.evaluateFormula(this.formulaFormControl.value);
      });

    this.formulaFormControl.valueChanges
      .subscribe((formula: string) => {
        this.evaluateFormula(formula);
      });
  }

  private initInputOutputFieldsSelection() {
    this.fieldOptions = this.packet.fields
      .filter(({ description }) => description !== 'output')
      .map((field) => {
        return {
          field: {
            id: field.id,
            name: field.name
          },
          disabled: false,
        };
      });

    this.outputPacketFieldList = this.packet.fields.filter(({ description }) => description === 'output');
  }

  private evaluateFormula(formula: string) {
    this.config.formula = undefined;

    if (!formula) {
      this.formulaFormControl.setErrors({ 'formulaIsEmpty': true });
      this.logger.debug('formula is empty');
      return;
    }

    const variableList: Variable[] = this.variablesFormArray.value;
    const constantList: Constant[] = this.constantList.value;

    if (
      this.variablesFormArray.length === 0
      || variableList.some(({ field }) => !field?.id)
    ) {
      this.formulaFormControl.setErrors({ 'placeholderUnset': true });
      this.logger.debug('placeholder unset');
      return;
    }

    formula = formula.replace(',', '.');

    try {
      let feedbackFormula = formula;

      for (const { placeHolder, field } of variableList) {
        const escapePlaceholder = placeHolder.replace('$', '\\$');
        formula = formula.replace(new RegExp(escapePlaceholder, 'gi'), field.name);
        feedbackFormula = feedbackFormula.replace(new RegExp(escapePlaceholder, 'gi'), '1'); //custom value used only for validation
      }

      for (const { field } of variableList) {
        if (!formula.includes(field.name)) {
          this.formulaFormControl.setErrors({ 'placeholderNotUsed': true });
          this.logger.debug(`placeholder ${field.name} not used`);
          return;
        }
      }

      for (const operator of DataSimulatorSettings.Utils.expressionOperators) {
        formula = formula.replace(new RegExp(operator.regex, 'gi'), operator.function);
        feedbackFormula = feedbackFormula.replace(new RegExp(operator.regex, 'gi'), operator.function);
      }

      if (formula) {
        new Function(`return ${feedbackFormula}`)();

        this.logger.debug('formula is valid', formula);
        this.formulaFormControl.setErrors(null);

        let formulaRow = formula;
        for (const { placeHolder, field } of variableList) {
          formulaRow = formulaRow.replace(new RegExp(field.name, 'gi'), placeHolder);
        }

        this.config.formula = formula;
        this.config.formulaRow = formulaRow;
      } else {
        this.logger.debug('formula is empty');
        this.formulaFormControl.setErrors({ 'invalid': true });
      }
    } catch (error) {
      this.logger.debug('formula is not valid', formula);
      this.formulaFormControl.setErrors({ 'invalid': true });
    }
  }

  disableAdd(): boolean {
    return this.variablesFormArray.controls.length === this.fieldOptions.length
      || this.fieldOptions.every(({ disabled }) => disabled);
  }

  addVariable(variable?: Variable): void {
    if (variable) {
      this.variablesFormArray.push(
        this.fb.group({
          placeHolder: this.fb.control(variable.placeHolder, Validators.required),
          field: this.fb.control(variable.field, Validators.required),
        })
      );
    } else {
      const placeHolder = `$val${this.variablesFormArray.controls.length + 1}`;

      this.variablesFormArray.push(
        this.fb.group({
          placeHolder: this.fb.control(placeHolder, Validators.required),
          field: this.fb.control(null, Validators.required),
        })
      );
    }
  }

  deleteVariable(index: number): void {
    this.variablesFormArray.removeAt(index);

    if (this.variablesFormArray.controls.length > 0) {
      for (let counter = 0; counter < this.variablesFormArray.controls.length; counter++) {
        const element = this.variablesFormArray.controls[counter];
        element.get('placeHolder').setValue(`$val${counter + 1}`);
      }
    }
  }

  addConstant(constant?: Constant): void {
    this.constantList.push(
      this.fb.group(
        constant
          ? {
            name: this.fb.control(constant.name, Validators.required),
            value: this.fb.control(constant.value, Validators.required)
          }
          : {
            name: this.fb.control(null, Validators.required),
            value: this.fb.control(null, Validators.required)
          }
      )
    );
  }

  deleteConstant(index: number): void {
    this.constantList.removeAt(index);
  }

  isDirty(): boolean {
    return this.formulaFormControl.dirty
      || this.variablesFormArray.dirty
      || this.outputPacketFieldGroup.dirty;
  }

  isValid(): boolean {
    return this.formulaFormControl.valid
      && this.variablesFormArray.valid
      && this.outputPacketFieldGroup.valid
      && Boolean(this.config.formula)
      && Boolean(this.config.outputFieldId);
  }

  updatePacketField() {
    this.hPacketService.updateHPacketField(
      this.packet.id,
      this.outputPacketFieldGroup.value
    ).subscribe({
      next: (res: HPacketField) => {
        this.enableEditPackedField = false;
        this.outputPacketFieldGroup.patchValue(res);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === HttpStatusCode.Conflict) {
          this.errorCreationOutputField = 'Output field already present';
        }
      }
    });
  }

  createPacketField() {
    this.errorCreationOutputField = undefined;

    const { name, description, multiplicity, type } = this.outputPacketFieldGroup.value;

    this.hPacketService.addHPacketField(
      this.packet.id, {
        name,
        description,
        multiplicity,
        type
      } as HPacketField
    ).subscribe({
      next: (res: HPacketField) => {
        this.outputPacketFieldGroup.patchValue(res);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === HttpStatusCode.Conflict) {
          this.errorCreationOutputField = 'Output field already present';
        }
      }
    });
  }

}
