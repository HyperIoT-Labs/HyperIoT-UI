import { Component, Input, OnChanges, ViewEncapsulation, forwardRef } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR, ValidationErrors,
  Validators
} from '@angular/forms';
import { CoreConfig, HPacket, HPacketFieldsHandlerService } from 'core';
import {FieldType, IRulePart} from './rule-part/rule-part.interface';
import {SelectOption, SelectOptionGroup} from '../hyt-select/hyt-select.component';
import { Option } from '../hyt-radio-button/hyt-radio-button.component';
import { DialogService } from '../hyt-dialog/dialog.service';
import { RuleErrorModalComponent } from './rule-error/rule-error-modal.component';
import { PacketRulePart } from './rule-part/packet-rule-part';
import { parseRuleText } from './rule-part/operations.utils';

interface RulePart {
  label: string;
  fieldType: FieldType;
  options?: SelectOption[];
  optionsGroup?: SelectOptionGroup[];
  valueMap?: Map<string, IRulePart>;
  ruleify: (value: string) => string;
  prettify: (value: string) => string;
}

interface RuleRow {
  ruleParts: RulePart[];
}

/**
 * RuleDefinitionComponent is a form component that allows obtaining a rule definition in string format
 * through a dynamic form that self-constructs based on user input.
 */
@Component({
  selector: 'hyt-rule-definition',
  templateUrl: './rule-definition.component.html',
  styleUrls: ['./rule-definition.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RuleDefinitionComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RuleDefinitionComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
})
export class RuleDefinitionComponent implements ControlValueAccessor, OnChanges {
  @Input() allPackets: HPacket[] = [];
  @Input() currentPacket: HPacket;
  @Input() required: boolean = false;
  errorMessage: string = '';

  ruleDefinitionError = false;

  ruleRows: RuleRow[] = [];
  ruleForm = new FormGroup({
    ruleRowsArray: new FormArray([]),
  });

  value: { ruleDefinition: string; rulePrettyDefinition: string };
  originalValue = '';

  joinOptions: Option[] = [
    { value: 'AND', label: $localize`:@@HYT_operations_AND:AND`, checked: false },
    { value: 'OR', label: $localize`:@@HYT_operations_OR:OR`, checked: false },
  ];

  constructor(
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService,
    private dialogService: DialogService,
    private coreConfigService: CoreConfig,
  ) {
    if (!this.coreConfigService.ruleNodes) {
      this.ruleDefinitionError = true;
    }
  }

  ngOnChanges() {
    if (this.allPackets) {
      this.resetRuleDefinition();
    }
  }

  resetRuleDefinition(): void {
    this.ruleRowsFormArray.clear();
    this.ruleRows = [];
    this.addCondition(-1);
  }

  onRuleValueChanged(event, ruleRowIndex: number, rulePartIndex: number) {
    this.onRulePartChanged(event, ruleRowIndex, rulePartIndex);
    this.buildRuleDefinition();
  }

  onRulePartChanged(event, ruleRowIndex: number, rulePartIndex: number) {

    const rulePart = this.ruleRows[ruleRowIndex].ruleParts[rulePartIndex];

    if (rulePart.fieldType === 'text' || !rulePart.valueMap.has(String(event))) { // exit if no new fields should be added
      return;
    }

    const selectedIPart: IRulePart = rulePart.valueMap.get(String(event));

    // removing fields after modified field
    // this.ruleRows[ruleRowIndex].ruleParts.splice(rulePartIndex + 1);
    for (let i = this.ruleRows[ruleRowIndex].ruleParts.length - 1; i > rulePartIndex; i--) {
      this.ruleRows[ruleRowIndex].ruleParts.pop();
      this.getRowFormGroup(ruleRowIndex).removeControl('rule-part-' + i);
    }

    this.ruleRows[ruleRowIndex].ruleParts.push({
      label: selectedIPart.label,
      fieldType: selectedIPart.fieldType,
      options: selectedIPart.generateOptions?.() || [],
      optionsGroup: selectedIPart.generateOptionsGroup?.() || [],
      valueMap:  selectedIPart.generateChildrenRuleParts?.() || new Map<string, IRulePart>(),
      ruleify: selectedIPart.ruleify,
      prettify: selectedIPart.prettify,
    });

    this.getRowFormGroup(ruleRowIndex).addControl('rule-part-' + (rulePartIndex + 1), new FormControl('', selectedIPart.validators));

  }

  addCondition(index) {
    if (this.ruleRows.length === index + 1) {

      const packetRulePart = new PacketRulePart(this.allPackets, this.coreConfigService.ruleNodes, this.hPacketFieldsHandlerService);
      this.ruleRows.push({
        ruleParts: [{
          label: packetRulePart.label,
          fieldType: packetRulePart.fieldType,
          options: packetRulePart.generateOptions(),
          optionsGroup: packetRulePart.generateOptionsGroup(),
          valueMap: packetRulePart.generateChildrenRuleParts(),
          ruleify: packetRulePart.ruleify,
          prettify: packetRulePart.prettify,
        }],
      });

      this.ruleRowsFormArray.push(new FormGroup({
        'rule-part-0': new FormControl('', packetRulePart.validators),
        'ruleJoin': new FormControl(''),
      }));

      if (this.currentPacket) {
        this.getRowFormGroup(index + 1).get('rule-part-0').setValue(String(this.currentPacket.id));
        this.getRowFormGroup(index + 1).get('rule-part-0').disable();
        this.onRulePartChanged(String(this.currentPacket.id), index + 1, 0);
      }
    }
    this.validateField();

  }

  removeCondition(index) {
    this.ruleRows.splice(index, 1);
    this.ruleRowsFormArray.removeAt(index);
    this.ruleRowsFormArray.at(this.ruleRows.length - 1).get('ruleJoin').setValue('');
    this.buildRuleDefinition();
    this.validateField();
  }

  onChange: any = (value: any) => { };
  onTouched: any = () => { };

  writeValue(rule: { ruleDefinition: string; rulePrettyDefinition: string }): void {

    this.resetRuleDefinition();

    if (!rule || !rule.ruleDefinition) {
      return;
    }

    let ruleDefinition = rule.ruleDefinition;

    try {

      // remove all " occurrences and any leading or trailing white space
      ruleDefinition = ruleDefinition.replace(/"/g, '').trim();

      const ruleArray: string[] = ruleDefinition.match(/[^AND|OR]+(AND|OR)?/g).map(x => x.trim());

      for (let k = 0; k < ruleArray.length; k++) {
        // TODO the rule parts should be recognized by RulePart classes somehow
        const tempSplitted: string[] = ruleArray[k].split(' ').filter(i => i);
        const packetFieldPart = tempSplitted.shift();
        const splitted: string[] = packetFieldPart.split('.').concat(tempSplitted);

        this.addCondition(k - 1);

        splitted.forEach((part, i) => {

          if (this.joinOptions.some(jo => jo.value === part)) {

            // set operator on previous form row
            this.ruleRowsFormArray.at(k).get('ruleJoin').setValue(part);

          } else {

            // set form value
            this.ruleRowsFormArray.at(k).get('rule-part-' + i).setValue(part);
            // create new field based on set value
            this.onRulePartChanged(part, k, i);

          }

        });

      }

      this.originalValue = ruleDefinition;
      this.validateField();

    } catch (error) {
      this.resetRuleDefinition();
      this.dialogService.open(RuleErrorModalComponent, { data: { ruleDefinition } });
    }

  }

  buildRuleDefinition() {
    let rd = '';
    let ptf = '';
    for (let i = 0; i < this.ruleRows.length; i++) {

      const ruleRow = this.ruleRows[i];
      const ruleRowFormGroup = this.getRowFormGroup(i);
      for (let j = 0; j < ruleRow.ruleParts.length; j ++) {

        const rulePart  = ruleRow.ruleParts[j];
        const value = parseRuleText(ruleRowFormGroup.get('rule-part-' + j).value, rulePart.fieldType);

        rd = rd.concat(rulePart.ruleify(value));
        ptf = ptf.concat(rulePart.prettify(value));

      }
      if (ruleRowFormGroup.get('ruleJoin').value) {
        const ruleJoinValue = ruleRowFormGroup.get('ruleJoin').value;
        rd = rd.concat(' ' + ruleJoinValue) + ' ';
        ptf = ptf.concat(' ' + this.joinOptions.find(jo => jo.value === ruleJoinValue).label + ' ');
      }

    }
    this.value = {
      ruleDefinition: rd,
      rulePrettyDefinition: ptf,
    };
    this.validateField();
    this.onChange(this.value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  isDirty() {
    return this.ruleForm.dirty;
    // return this.value !== this.originalValue;
  }

  isInvalid() {
    return this.ruleForm.invalid || this.ruleDefinitionError || !!!this.errorMessage;
  }

  get ruleRowsFormArray() {
    return this.ruleForm.controls.ruleRowsArray as FormArray;
  }

  getRowFormGroup(index): FormGroup {
    return this.ruleRowsFormArray.at(index) as FormGroup;
  }

  getFormControl(rowIndex, partIndex) {
    return this.ruleForm.get('ruleRowsArray.' + rowIndex + '.rule-part-' + partIndex) as FormControl;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validateField();
  }


  validateField(): ValidationErrors | null {
    if (!this.ruleForm.valid) {
      this.errorMessage = 'Not valid!';
      return { notValid: true };
    }
    if (this.required && !this.ruleForm.valid) {
      this.errorMessage = 'This field is required';
      return { required: true };
    }
    this.errorMessage = '';
    return null;
  }

}
