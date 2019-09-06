import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { HPacketField, HPacket } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';

@Component({
  selector: 'hyt-rule-definition',
  templateUrl: './rule-definition.component.html',
  styleUrls: ['./rule-definition.component.scss']
})
export class RuleDefinitionComponent implements OnInit, OnChanges {

  @Input() hPacket: HPacket;

  ruleDefForms: FormGroup[] = [];

  fieldOptions: SelectOption[] = [];

  //conditionOptions: SelectOption[] = [];

  // allConditionOptions = [
  //   { value: '>', label: '(>) Greater', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
  //   { value: '>=', label: '(>=) Greater / Equal', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
  //   { value: '<', label: '(<) Lower', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
  //   { value: '<=', label: '(<=) Lower / Equal', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
  //   { value: '=', label: '(=) Equal', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'] },
  //   { value: '!=', label: '(!=) Different', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'] },
  //   { value: '()', label: '(()) Like', type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'BOOLEAN', 'DATE'] },
  //   { value: 'isTrue', label: 'isTrue', type: ['OBJECT', 'BOOLEAN'] },
  //   { value: 'isFalse', label: 'isFalse', type: ['OBJECT', 'BOOLEAN'] }
  // ]

  allConditionOptions = [
    { value: '>', label: '(>) Greater' },
    { value: '>=', label: '(>=) Greater / Equal' },
    { value: '<', label: '(<) Lower' },
    { value: '<=', label: '(<=) Lower / Equal' },
    { value: '=', label: '(=) Equal' },
    { value: '!=', label: '(!=) Different' },
    { value: '()', label: '(()) Like' },
    { value: 'isTrue', label: 'isTrue' },
    { value: 'isFalse', label: 'isFalse' }
  ]

  joinOptions: Option[] = [
    { value: ' AND ', label: 'AND', checked: false },
    { value: ' OR ', label: 'OR', checked: false }
  ]

  // @Output() ruleDefinition = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.ruleDefForms.push(this.fb.group({}));
  }

  ngOnChanges() {
    this.fieldOptions = [];
    console.log(this.hPacket)
    if (this.hPacket)
      for (let el of this.hPacket.fields)
        this.fieldOptions.push({ value: el.name, label: el.name })
  }

  addCondition(index) {
    if (this.ruleDefForms.length == index + 1)
      this.ruleDefForms.push(this.fb.group({}));
  }

  removeCondition(index) {
    this.ruleDefForms.splice(index, 1)
  }
  // this.packetForm.value.packetIdentification

  buildRuleDefinition() {
    let rd = '';
    for (let k = 0; k < this.ruleDefForms.length; k++) {
      let element: string = (this.hPacket && this.ruleDefForms[k].value.ruleField) ? this.hPacket.name + '.' + this.ruleDefForms[k].value.ruleField + ' ' : '';
      let condition: string = (this.ruleDefForms[k].value.ruleCondition) ? this.ruleDefForms[k].value.ruleCondition + ' ' : '';
      let valueRule: string = (this.ruleDefForms[k].value.ruleValue) ? this.ruleDefForms[k].value.ruleValue + ' ' : '';
      let joinRule: string = (this.ruleDefForms[k].value.ruleJoin.value) ? this.ruleDefForms[k].value.ruleJoin.value + ' ' : '';
      rd += element + condition + valueRule + joinRule;
    }

    console.log(rd)
    return rd;
  }

  onChange(event) {
    console.log("ciao")
  }

  isFormInvalid(k: number): boolean {
    return (
      this.ruleDefForms[k].get('ruleField').invalid ||
      this.ruleDefForms[k].get('ruleCondition').invalid ||
      this.ruleDefForms[k].get('ruleValue').invalid
    )
  }

  isInvalid() {
    for (let k = 0; k < this.ruleDefForms.length; k++)
      if (this.isFormInvalid(k))
        return true;
    return false;
  }

}
