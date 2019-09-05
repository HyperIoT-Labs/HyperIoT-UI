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
    // this.fieldOptions = [];
    //if(this.hPacket)
    // for (let el of this.hPacket.fields)
    //   this.fieldOptions.push({ value: el.id.toString(), label: el.name })
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
      let element: string = (this.hPacket && this.ruleDefForms[k].value.fieldOptions) ? this.hPacket.name + '.' + this.ruleDefForms[k].value.fieldOptions + ' ' : '';
      let condition: string = (this.ruleDefForms[k].value.conditionRule) ? this.ruleDefForms[k].value.conditionRule + ' ' : '';
      let valueRule: string = (this.ruleDefForms[k].value.valueRule) ? this.ruleDefForms[k].value.valueRule + ' ' : '';
      let joinRule: string = (this.ruleDefForms[k].value.joinRule.value) ? this.ruleDefForms[k].value.joinRule.value + ' ' : '';
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
      this.ruleDefForms[k].get('fieldOptions').invalid ||
      this.ruleDefForms[k].get('conditionRule').invalid ||
      this.ruleDefForms[k].get('valueRule').invalid
    )
  }

  isInvalid() {
    for (let k = 0; k < this.ruleDefForms.length; k++)
      if (this.isFormInvalid(k))
        return true;
    return false;
  }

}
