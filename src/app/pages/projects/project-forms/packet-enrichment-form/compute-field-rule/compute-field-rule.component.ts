import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HPacket, HPacketField, HpacketsService, HProject, Logger, LoggerService } from 'core';
import { EnrichmentType } from '../enrichment-type.enum';
import { DataSimulatorSettings } from 'widgets'
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

type Field = {
  label: string,
  field: string,
  disabled: boolean
}

type RuleConfiguration = {
  actionName: string,
  outputFieldId: number,
  outputFieldName: string,
  formula: string
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

  _config: RuleConfiguration = {
    actionName: EnrichmentType.COMPUTE_FIELD_RULE_ACTION,
    formula: undefined,
    outputFieldId: undefined,
    outputFieldName: undefined
  };

  @Input()
  set config(cfg: RuleConfiguration) {
    this._config = cfg;
    cfg.actionName = EnrichmentType.COMPUTE_FIELD_RULE_ACTION;
  }

  get config() {
    return this._config;
  }

  readonly output = this.fb.group({
    formula: ['', Validators.required],
    constants: this.fb.array([]),
    // outputPacketField: ['', Validators.required]
  });

  readonly outputPacketFieldGroup = this.fb.group({
    id: [],
    name: ['', Validators.required],
    description: ['output', Validators.required],
    multiplicity: ['', Validators.required],
    type: ['', Validators.required]
  })

  get formulaFormControl(): FormControl {
    return this.output.get('formula') as FormControl;
  }

  get constantList(): FormArray {
    return this.output.get('constants') as FormArray;
  }

  readonly placeholderAliasFormArray = this.fb.array([]);

  fieldOptions: Field[] = [];
  outputPacketFieldList: HPacketField[] = [];

  readonly packetFieldDetail = {
    multiplicity: HPacketField.MultiplicityEnum,
    type: HPacketField.TypeEnum,
  } as const;

  // @ViewChild('tab') tab: MatTabGroup;
  // @ViewChild('selectPacketField') selectPacketField: MatSelect;

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
    this.initInputOutputFieldsSelection();

    this.addField();
    this.addConstant();

    //TEST
    this.output.valueChanges.subscribe((value) => {
      console.log(value);
    })

    this.outputPacketFieldGroup.valueChanges.subscribe((value) => {
      console.log(value);

      if (value.id) {
        this.config.outputFieldId = value.id;
      }

      this.config.outputFieldName = value.name;
    })

    this.placeholderAliasFormArray.valueChanges.subscribe((value) => {
      const selectedFieldList = value.filter(({ field }) => field);

      for (const element of this.fieldOptions) {
        element.disabled = selectedFieldList.some(({ field }) => field === element.field);
      }

      this.evaluateFormula(this.formulaFormControl.value);
    });

    this.constantList.valueChanges.subscribe(() => {
      this.evaluateFormula(this.formulaFormControl.value);
    });

    this.formulaFormControl.valueChanges.subscribe((formula: string) => {
      this.evaluateFormula(formula);
    });
  }

  private initInputOutputFieldsSelection() {
    this.fieldOptions = this.packet.fields
      .filter(({ description }) => description !== 'output')
      .map(({ name, id }) => {
        return {
          label: name,
          field: id.toString(),
          disabled: false
        };
      });

    this.outputPacketFieldList = this.packet.fields.filter(({ description }) => description === 'output');
  }

  private evaluateFormula(formula: string) {
    this.config.formula = undefined;

    if (this.placeholderAliasFormArray.length === 0) {
      this.formulaFormControl.setErrors({ 'incorrect': true });
      this.logger.debug('no placeholder was used');
      return;
    }

    formula = formula.replace(',', '.');
    try {
      for (const { name, value } of this.constantList.value) {
        formula = formula.replace(new RegExp(name, 'gi'), value);
      }

      for (const { placeHolder, field } of this.placeholderAliasFormArray.value) {
        const escapePlaceholder = placeHolder.replace('$', '\\$');
        formula = formula.replace(new RegExp(escapePlaceholder, 'gi'), field);
      }

      for (const operator of DataSimulatorSettings.Utils.expressionOperators) {
        formula = formula.replace(operator.regex, operator.function);
      }

      if (formula) {
        new Function(`return ${formula}`)();

        this.logger.debug('formula is valid', formula);
        this.formulaFormControl.setErrors(null);

        this.config.formula = formula;
      } else {
        this.logger.debug('formula is empty');
        this.formulaFormControl.setErrors({ 'incorrect': true });
      }
    } catch (error) {
      this.logger.debug('formula is not valid', formula);
      this.formulaFormControl.setErrors({ 'incorrect': true });
    }
  }

  disableAdd(): boolean {
    return this.placeholderAliasFormArray.controls.length === this.fieldOptions.length
      || this.fieldOptions.every(({ disabled }) => disabled);
  }

  addField(): void {
    const counter = this.placeholderAliasFormArray.controls.length === 0
      ? 1
      : this.placeholderAliasFormArray.controls.length + 1;

    const row = this.fb.group({
      placeHolder: this.fb.control(`$val${counter}`, Validators.required),
      field: this.fb.control('', Validators.required)
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
    this.constantList.push(
      this.fb.group({
        name: this.fb.control('', Validators.required),
        value: this.fb.control('', Validators.required)
      })
    );
  }

  deleteConstant(index: number): void {
    this.constantList.removeAt(index);
  }

  isDirty(): boolean {
    return this.formulaFormControl.dirty;
  }

  isValid(): boolean {
    return this.formulaFormControl.valid;
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

        // this.tab.selectedIndex = 0;

        // this.hPacketService.findTreeFields(this.packet.id)
        //   .subscribe({
        //     next: (hPacketFieldList) => {
        //       this.packet.fields = hPacketFieldList;

        //       this.initInputOutputFieldsSelection();

        //       this.output.controls.outputPacketField.setValue(res);
        //     },
        //     error: () => {

        //     }
        //   });
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === HttpStatusCode.Conflict) {
          this.errorCreationOutputField = 'Output field already present';
        }
      }
    });
  }

}
