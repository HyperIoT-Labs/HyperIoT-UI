import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { HPacket, HPacketField } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';

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

  @Input() hPacket: HPacket;

  fieldOptions: SelectOption[] = [];

  ruleForms: RuleForm[] = [];

  allConditionOptions = [
    { value: '>', label: '(>) Greater', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '>=', label: '(>=) Greater / Equal', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '<', label: '(<) Lower', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '<=', label: '(<=) Lower / Equal', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '=', label: '(=) Equal', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'] },
    { value: '!=', label: '(!=) Different', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'] },
    { value: '()', label: '(()) Like', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'BOOLEAN', 'DATE'] },
    { value: 'isTrue', label: 'isTrue', type: ['OBJECT', 'BOOLEAN'] },
    { value: 'isFalse', label: 'isFalse', type: ['OBJECT', 'BOOLEAN'] }
  ]

  comared: boolean = true;

  joinOptions: Option[] = [
    { value: ' AND ', label: 'AND', checked: false },
    { value: ' OR ', label: 'OR', checked: false }
  ]

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.ruleForms.push({
      form: this.fb.group({}),
      conditionOptions: [],
      compareWith: false
    })
  }

  fieldFlatList: FieldList[] = [];

  extractField(fieldArr: HPacketField[], pre: string) {
    fieldArr.forEach(f => {
      let fieldName: string = pre + '.' + f.name;
      console.log(fieldName)
      this.fieldFlatList.push({ field: f, label: fieldName });
      if (f.innerFields)
        this.extractField(f.innerFields, fieldName);
    })
  }

  ngOnChanges() {
    this.fieldOptions = [];
    if (this.hPacket)
      this.extractField(this.hPacket.fields, '');
    for (let el of this.fieldFlatList)
      this.fieldOptions.push({ value: el.label, label: el.field.name });
    console.log(this.fieldFlatList)
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

  buildRuleDefinition() {
    let rd = '';
    for (let k = 0; k < this.ruleForms.length; k++) {
      let element: string = (this.hPacket && this.ruleForms[k].form.value.ruleField) ? this.hPacket.name + this.ruleForms[k].form.value.ruleField + ' ' : '';
      let condition: string = (this.ruleForms[k].form.value.ruleCondition) ? this.ruleForms[k].form.value.ruleCondition + ' ' : '';
      let valueRule: string = (this.ruleForms[k].form.value.ruleValue) ? this.ruleForms[k].form.value.ruleValue : '';
      let joinRule: string = (this.ruleForms[k].form.value.ruleJoin) ? this.ruleForms[k].form.value.ruleJoin.value : '';
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
    this.ruleForms[index].compareWith = (type == 'BOOLEAN') ? false : true;
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

  isInvalid() {
    for (let k = 0; k < this.ruleForms.length; k++)
      if (this.isFormInvalid(k))
        return true;
    return false;
  }

}
