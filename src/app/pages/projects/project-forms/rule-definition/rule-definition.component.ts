import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { HPacket, HPacketField } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { I18n } from '@ngx-translate/i18n-polyfill';

interface RuleForm {
  form: FormGroup;
  conditionOptions: SelectOption[];
  compareWith: boolean
}

interface FieldList {
  field: HPacketField;
  label: string;
}

@Component({
  selector: 'hyt-rule-definition',
  templateUrl: './rule-definition.component.html',
  styleUrls: ['./rule-definition.component.scss']
})
export class RuleDefinitionComponent implements OnInit, OnChanges {

  @Input() currentPacket: HPacket;

  fieldOptions: SelectOption[] = [];

  ruleForms: RuleForm[] = [];

  allConditionOptions = [
    { value: '>', label: this.i18n('HYT_(>)_greater'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '>=', label: this.i18n('HYT_(>=)_greater_equal'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '<', label: this.i18n('HYT_(<)_lower'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '<=', label: this.i18n('HYT_(<=)_lower_equal'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '=', label: this.i18n('HYT_(==)_equal'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'] },
    { value: '!=', label: this.i18n('HYT_(!=)_different'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'] },
    { value: '()', label: this.i18n('HYT_(())_like'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'BOOLEAN', 'DATE'] },
    { value: 'isTrue', label: this.i18n('HYT_is_true'), type: ['OBJECT', 'BOOLEAN'] },
    { value: 'isFalse', label: this.i18n('HYT_is_false'), type: ['OBJECT', 'BOOLEAN'] }
  ]

  joinOptions: Option[] = [
    { value: ' AND ', label: this.i18n('HYT_AND'), checked: false },
    { value: ' OR ', label: this.i18n('HYT_OR'), checked: false }
  ]

  private originalFormsValues = '';

  constructor(
    public fb: FormBuilder,
    private wizardService: ProjectWizardService,
    private i18n: I18n
  ) { }

  ngOnInit() {
    this.resetRuleDefinition();
  }

  resetRuleDefinition(): void {
    this.ruleForms = [({
      form: this.fb.group({}),
      conditionOptions: [],
      compareWith: false
    })];
  }

  fieldFlatList: FieldList[] = [];

  extractField(fieldArr: HPacketField[], pre: string) {
    fieldArr.forEach(f => {
      let fieldName: string = pre + '.' + f.name;
      this.fieldFlatList.push({ field: f, label: fieldName });
      if (f.innerFields)
        this.extractField(f.innerFields, fieldName);
    });
  }

  ngOnChanges() {
    this.resetRuleDefinition();
    let fieldList: HPacketField[] = [];
    if (this.currentPacket && this.currentPacket.id)
      fieldList = this.wizardService.treefy(this.currentPacket.fields);
    this.fieldOptions = [];
    this.fieldFlatList = [];
    this.extractField(fieldList, 'packet');
    for (let el of this.fieldFlatList)
      this.fieldOptions.push({ value: el.label, label: el.field.name });
    this.fieldOptions = [...this.fieldOptions];
  }

  addCondition(index) {
    if (this.ruleForms.length == index + 1)
      this.ruleForms.push({
        form: this.fb.group({}),
        conditionOptions: [],
        compareWith: false
      });
  }

  removeCondition(index) {
    this.ruleForms.splice(index, 1)
    this.ruleForms[this.ruleForms.length - 1].form.get('ruleJoin').setValue(null);
  }

  buildRuleDefinition(): string {
    let rd = '';
    for (let k = 0; k < this.ruleForms.length; k++) {
      let element: string = (this.ruleForms[k].form.value.ruleField) ? this.ruleForms[k].form.value.ruleField : '';
      let condition: string = (this.ruleForms[k].form.value.ruleCondition) ? ' ' + this.ruleForms[k].form.value.ruleCondition : '';
      let valueRule: string = (this.ruleForms[k].form.value.ruleValue) ? ' ' + this.ruleForms[k].form.value.ruleValue : '';
      let joinRule: string = (this.ruleForms[k].form.value.ruleJoin) ? this.ruleForms[k].form.value.ruleJoin : '';
      rd += element + condition + valueRule + joinRule;
    }
    return rd;
  }

  fieldChanged(event, index) {
    let type = this.fieldFlatList.find(y => y.label == event.value).field.type;
    this.ruleForms[index].conditionOptions = [];

    this.allConditionOptions.forEach(x => {
      if (x.type.includes(type))
        this.ruleForms[index].conditionOptions.push({ value: x.value, label: x.label })
    })
    this.ruleForms[index].compareWith = type != 'BOOLEAN';
  }

  isFormInvalid(k: number): boolean {
    let valArr = this.ruleForms[k].form;
    return (
      (Object.entries(valArr.value).length == 0) ?
        true :
        valArr.get('ruleField').invalid ||
        valArr.get('ruleCondition').invalid ||
        ((this.ruleForms[k].compareWith) ? valArr.get('ruleValue').invalid : false)
    )
  }

  isDirty(): boolean {
    return this.getJsonForms() !== this.originalFormsValues;
  }
  isInvalid(): boolean {
    for (let k = 0; k < this.ruleForms.length; k++) {
      if (this.isFormInvalid(k)) {
        return true;
      }
    }
    return false;
  }

  setRuleDefinition(ruleDefinition: string): void {
    setTimeout(() => {
      if (ruleDefinition && ruleDefinition.length != 0) {
        this.ruleForms = [];
        let ruleArray: string[] = ruleDefinition.split(/(?<= AND )|(?<= OR )/);

        for (let k = 0; k < ruleArray.length; k++) {
          let splitted: string[] = ruleArray[k].split(' ');

          const f = this.fieldFlatList.find(x => x.label == splitted[0]);
          if (!f) continue;
          let actualField: HPacketField = f.field;

          let conditionOptions = [];
          this.allConditionOptions.forEach(x => {
            if (x.type.includes(actualField.type))
              conditionOptions.push({ value: x.value, label: x.label })
          })

          this.ruleForms.push({
            form: this.fb.group({}),
            conditionOptions: conditionOptions,
            compareWith: actualField.type != 'BOOLEAN'
          });

          setTimeout(() => {
            this.ruleForms[k].form.get('ruleField').setValue(this.fieldOptions.find(x => x.value == splitted[0]).value);
            this.ruleForms[k].form.get('ruleCondition').setValue(splitted[1]);
            if (this.ruleForms[k].compareWith) {
              this.ruleForms[k].form.get('ruleValue').setValue(splitted[2]);
              this.ruleForms[k].form.get('ruleJoin').setValue((splitted[3]) ? ' ' + splitted[3] + ' ' : null);
            }
            else
              this.ruleForms[k].form.get('ruleJoin').setValue((splitted[2]) ? ' ' + splitted[2] + ' ' : null);
            if (k === this.ruleForms.length - 1) {
              this.originalFormsValues = this.getJsonForms();
            }
          }, 0);
        }

      }
    }, 0);
  }

  private getJsonForms() {
    let currentValue = '';
    this.ruleForms.map((rf) => currentValue += JSON.stringify(rf.form.value));
    return currentValue;
  }
}
