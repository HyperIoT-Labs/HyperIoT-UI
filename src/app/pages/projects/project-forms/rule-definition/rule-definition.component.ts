import { Component, OnInit, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { HPacket, HPacketField } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';
import { HytModalService } from '@hyperiot/components';
import { RuleErrorModalComponent } from './rule-error/rule-error-modal.component';

interface RuleForm {
  form: FormGroup;
  conditionOptions: SelectOption[];
  compareWith: boolean;
}

interface FieldList {
  field: HPacketField;
  label: string;
}

interface RuleDefinition {
  field: string;
  condition: string;
  value?: string;
  join?: string;
}

@Component({
  selector: 'hyt-rule-definition',
  templateUrl: './rule-definition.component.html',
  styleUrls: ['./rule-definition.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RuleDefinitionComponent implements OnInit, OnChanges {

  @Input() currentPacket: HPacket;

  fieldOptions: SelectOption[] = [];

  ruleForms: RuleForm[] = [];

  /**
   * A flat list of the selected Packet fields
   */
  fieldFlatList: FieldList[] = [];

  /**
   * Updating is true when the rule-definition is loaded. It is used to avoid expressionchangedafterviewchecked (isDirty)
   * TODO remove aftersetRuleDefinition() rework.
   */
  updating = false;

  /**
   * allConditionOptions stores the information of the condition option.
   */
  allConditionOptions = [
    { value: '>', label: this.i18n('HYT_(>)_greater'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '>=', label: this.i18n('HYT_(>=)_greater_equal'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '<', label: this.i18n('HYT_(<)_lower'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '<=', label: this.i18n('HYT_(<=)_lower_equal'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'] },
    { value: '==', label: this.i18n('HYT_(==)_equal'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'] },
    { value: '!=', label: this.i18n('HYT_(!=)_different'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'] },
    { value: '()', label: this.i18n('HYT_(())_like'), type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'BOOLEAN', 'DATE'] },
    { value: 'isTrue', label: this.i18n('HYT_is_true'), type: ['OBJECT', 'BOOLEAN'] },
    { value: 'isFalse', label: this.i18n('HYT_is_false'), type: ['OBJECT', 'BOOLEAN'] }
  ];

  /**
   * joinOptions stores the information of the join option.
   */
  joinOptions: Option[] = [
    { value: ' AND ', label: this.i18n('HYT_AND'), checked: false },
    { value: ' OR ', label: this.i18n('HYT_OR'), checked: false }
  ];

  /**
   * originalFormsValues is used to keep record of the old ruleDefinition value (dirty)
   */
  private originalFormsValues = '{"ruleField":"","ruleCondition":"","ruleValue":"","ruleJoin":""}';

  /**
   * class constructor
   * @param fb FormBuilder service instance
   * @param wizardService service needed to handle fields
   * @param i18n service for translations
   */
  constructor(
    public fb: FormBuilder,
    private hytModalService: HytModalService,
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
    this.originalFormsValues = '{"ruleField":"","ruleCondition":"","ruleValue":"","ruleJoin":""}';
  }

  extractField(fieldArr: HPacketField[], pre: string) {
    fieldArr.forEach(f => {
      const fieldName: string = pre + '.' + f.name;
      this.fieldFlatList.push({ field: f, label: fieldName });
      if (f.innerFields) {
        this.extractField(f.innerFields, fieldName);
      }
    });
  }

  findParent(fieldList: HPacketField[], packetField: HPacketField): HPacketField {
    const parent: HPacketField = fieldList.find(x => x.innerFields.some(y => y.id === packetField.id));
    if (parent) {
      return this.findParent(fieldList, parent);
    } else {
      return packetField;
    }
  }

  treefy(fieldList: HPacketField[]): HPacketField[] {
    const treefiedFields = [];
    fieldList.forEach(x => {
      const parent: HPacketField = this.findParent(fieldList, x);
      if (parent && !treefiedFields.some(y => y.id === parent.id)) {
        treefiedFields.push(parent);
      }
    });
    return treefiedFields;
  }

  ngOnChanges() {
    this.resetRuleDefinition();
    let fieldList: HPacketField[] = [];
    if (this.currentPacket && this.currentPacket.id) {
      fieldList = this.treefy(this.currentPacket.fields);
    }
    this.fieldOptions = [];
    this.fieldFlatList = [];
    this.extractField(fieldList, (this.currentPacket) ? this.currentPacket.id.toString() : '');
    this.fieldOptions = [...this.fieldFlatList.map(f => ({ value: f.label, label: f.field.name }))];
  }

  addCondition(index) {
    if (this.ruleForms.length === index + 1) {
      this.ruleForms.push({
        form: this.fb.group({}),
        conditionOptions: [],
        compareWith: false
      });
    }
  }

  removeCondition(index) {
    this.ruleForms.splice(index, 1);
    this.ruleForms[this.ruleForms.length - 1].form.get('ruleJoin').setValue('');
  }

  buildRuleDefinition(): string {
    let rd = '';
    for (const rule of this.ruleForms) {
      const element: string = (rule.form.value.ruleField) ? rule.form.value.ruleField : '';
      const condition: string = (rule.form.value.ruleCondition) ? ' ' + rule.form.value.ruleCondition : '';
      const valueRule: string = (
        rule.form.value.ruleValue
        && rule.form.value.ruleCondition !== 'isTrue'
        && rule.form.value.ruleCondition !== 'isFalse'
      ) ? ' ' + rule.form.value.ruleValue : '';
      const joinRule: string = (
        rule.form.value.ruleJoin === ' AND ' ||
        rule.form.value.ruleJoin === ' OR '
      ) ? rule.form.value.ruleJoin : '';
      rd += JSON.stringify(element) + condition + valueRule + joinRule;
    }
    return rd;
  }

  fieldChanged(event, index) {
    const type = this.fieldFlatList.find(y => y.label === event.value).field.type;
    this.ruleForms[index].conditionOptions = [];

    this.allConditionOptions.forEach(x => {
      if (x.type.includes(type)) {
        this.ruleForms[index].conditionOptions.push({ value: x.value, label: x.label });
      }
    });
    this.ruleForms[index].compareWith = type !== 'BOOLEAN';
  }

  isFormInvalid(k: number): boolean {
    const valArr = this.ruleForms[k].form;
    return (
      (Object.entries(valArr.value).length === 0) ?
        true :
        valArr.get('ruleField').invalid ||
        valArr.get('ruleCondition').invalid ||
        ((this.ruleForms[k].compareWith) ? valArr.get('ruleValue').invalid : false)
    );
  }

  isDirty(): boolean {
    return (this.getJsonForms() === '{}' || this.updating) ? false : this.getJsonForms() !== this.originalFormsValues;
  }
  isInvalid(): boolean {
    for (let k = 0; k < this.ruleForms.length; k++) {
      if (this.isFormInvalid(k)) {
        return true;
      }
    }
    return false;
  }

  /**
   * TODO rework (remove setTimeout)
   */
  setRuleDefinition(ruleDefinition: string): void {
    this.updating = true;
    const ruleDef: RuleDefinition[] = [];
    setTimeout(() => {
      if (ruleDefinition && ruleDefinition.length !== 0) {
        this.ruleForms = [];
        const ruleArray: string[] = ruleDefinition.split(/(?= AND )|(?= OR )/);

        for (let k = 0; k < ruleArray.length; k++) {
          const splitted: string[] = ruleArray[k].split(' ');
          if (k === 0) {
            ruleDef.push({
              field: JSON.parse(splitted[0]),
              condition: splitted[1],
              value: splitted[2] ? splitted[2] : null,
              join: null
            });
          } else {
            ruleDef[k - 1].join = splitted[1];
            ruleDef.push({
              field: JSON.parse(splitted[2]),
              condition: splitted[3],
              value: splitted[4] ? splitted[4] : null,
              join: null
            });
          }
        }

        for (let k = 0; k < ruleDef.length; k++) {

          const f = this.fieldFlatList.find(x => x.label === ruleDef[k].field);
          if (!f) {
            const modalRef = this.hytModalService.open(RuleErrorModalComponent);
            // this.modalService.open('hyt-rule-error-modal');
            return;
          }
          const actualField: HPacketField = f.field;

          const conditionOptions = [];
          this.allConditionOptions.forEach(x => {
            if (x.type.includes(actualField.type)) {
              conditionOptions.push({ value: x.value, label: x.label });
            }
          });

          this.ruleForms.push({
            form: this.fb.group({}),
            conditionOptions: conditionOptions,
            compareWith: actualField.type !== 'BOOLEAN'
          });

          setTimeout(() => {
            this.ruleForms[k].form.get('ruleField').setValue(this.fieldOptions.find(x => x.value === ruleDef[k].field).value);
            this.ruleForms[k].form.get('ruleCondition').setValue(ruleDef[k].condition);
            if (this.ruleForms[k].compareWith) {
              this.ruleForms[k].form.get('ruleValue').setValue(ruleDef[k].value);
            }
            this.ruleForms[k].form.get('ruleJoin').setValue((ruleDef[k].join) ? ' ' + ruleDef[k].join + ' ' : '');
            if (k === this.ruleForms.length - 1) {
              this.originalValueUpdate();
              this.updating = false;
            }
          }, 0);
        }

      }
    }, 0);
  }

  originalValueUpdate() {
    this.originalFormsValues = this.getJsonForms();
  }

  private getJsonForms() {
    let currentValue = '';
    this.ruleForms.map((rf) => currentValue += JSON.stringify(rf.form.value));
    return currentValue;
  }
}
