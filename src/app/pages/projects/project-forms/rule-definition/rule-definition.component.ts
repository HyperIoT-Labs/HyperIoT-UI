import { Component, Input, OnChanges, OnInit, ViewEncapsulation,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HytModalService, SelectOption } from '@hyperiot/components';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { HPacket, HPacketField, HpacketsService } from '@hyperiot/core';
import { RuleErrorModalComponent } from './rule-error/rule-error-modal.component';

interface RuleForm {
  form: FormGroup;
  conditionOptions: SelectOption[];
  compareWith: boolean;
  fieldOptions: SelectOption[];
}

interface FieldList {
  field: HPacketField;
  label: string;
}

interface RuleDefinition {
  packet: string;
  field: string;
  condition: string;
  value?: string;
  join?: string;
}

@Component({
  selector: "hyt-rule-definition",
  templateUrl: "./rule-definition.component.html",
  styleUrls: ["./rule-definition.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class RuleDefinitionComponent {
  @Input() projectId: number;

  @Input() ruleType: "event" | "enrichment";

  @Input() currentPacket: HPacket;

  allPackets: HPacket[] = null;

  packetOptions: SelectOption[] = [];

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
    {
      value: ">",
      label: $localize`:@@HYT_(>)_greater:(>) Greater`,
      type: ["OBJECT", "INTEGER", "DOUBLE", "FLOAT", "DATE"],
    },
    {
      value: ">=",
      label: $localize`:@@HYT_(>=)_greater_equal:(>=) Greater/Equal`,
      type: ["OBJECT", "INTEGER", "DOUBLE", "FLOAT", "DATE"],
    },
    {
      value: "<",
      label: $localize`:@@HYT_(<)_lower:(<) Lower`,
      type: ["OBJECT", "INTEGER", "DOUBLE", "FLOAT", "DATE"],
    },
    {
      value: "<=",
      label: $localize`:@@HYT_(<=)_lower_equal:(<=) Lower/Equal`,
      type: ["OBJECT", "INTEGER", "DOUBLE", "FLOAT", "DATE"],
    },
    {
      value: "==",
      label: $localize`:@@HYT_(==)_equal:(=) Equal`,
      type: ["OBJECT", "INTEGER", "DOUBLE", "FLOAT", "DATE", "TEXT"],
    },
    {
      value: "!=",
      label: $localize`:@@HYT_(!=)_different:(!=) Different`,
      type: ["OBJECT", "INTEGER", "DOUBLE", "FLOAT", "DATE", "TEXT"],
    },
    {
      value: "matches",
      label: $localize`:@@HYT_(())_like:(()) Like`,
      type: ["TEXT"],
    },
    {
      value: "isTrue",
      label: $localize`:@@HYT_is_true:Is true`,
      type: ["OBJECT", "BOOLEAN"],
    },
    {
      value: "isFalse",
      label: $localize`:@@HYT_is_false:Is false`,
      type: ["OBJECT", "BOOLEAN"],
    },
  ];

  /**
   * joinOptions stores the information of the join option.
   */
  joinOptions: Option[] = [
    { value: " AND ", label: $localize`:@@HYT_and:AND`, checked: false },
    { value: " OR ", label: $localize`:@@HYT_or:OR`, checked: false },
  ];

  /**
   * originalFormsValues is used to keep record of the old ruleDefinition value (dirty)
   */
  private originalFormsValues =
    this.ruleType === "enrichment"
      ? '{"ruleField":"","ruleCondition":"","ruleValue":"","ruleJoin":""}'
      : '{"rulePacket":"","ruleField":"","ruleCondition":"","ruleValue":"","ruleJoin":""}';

  /**
   * class constructor
   * @param fb FormBuilder service instance
   * @param hytModalService service to use modal
   * @param hPacketsService service for hPackets
   */
  constructor(
    public fb: FormBuilder,
    private hytModalService: HytModalService,
    private hPacketsService: HpacketsService,
    private cd: ChangeDetectorRef
  ) {}

  resetRuleDefinition(): void {
    this.ruleForms = [
      {
        form: this.fb.group({}),
        conditionOptions: [],
        compareWith: false,
        fieldOptions: [],
      },
    ];
    //sync between form inside html with formControls and next invocation on fields
    this.cd.detectChanges();

    if (this.ruleType === "enrichment") {
      this.ruleForms[0].form.get("rulePacket").disable();
      this.ruleForms[0].form
          .get("rulePacket")
          .setValue(this.currentPacket.id);
        this.ruleForms[0].fieldOptions = this.buildFieldOptions(this.currentPacket);      
    }

    this.originalFormsValues =
      this.ruleType === "enrichment"
        ? '{"ruleField":"","ruleCondition":"","ruleValue":"","ruleJoin":""}'
        : '{"rulePacket":"","ruleField":"","ruleCondition":"","ruleValue":"","ruleJoin":""}';
  }
  

  extractField(fieldArr: HPacketField[], pre?: string) {
    fieldArr.forEach((f) => {
      const fieldName: string = pre ? pre + "." + f.name : f.name;
      this.fieldFlatList.push({ field: f, label: fieldName });
      if (f.innerFields) {
        this.extractField(f.innerFields, fieldName);
      }
    });
  }

  findParent(
    fieldList: HPacketField[],
    packetField: HPacketField
  ): HPacketField {
    const parent: HPacketField = fieldList.find((x) =>
      x.innerFields.some((y) => y.id === packetField.id)
    );
    if (parent) {
      return this.findParent(fieldList, parent);
    } else {
      return packetField;
    }
  }

  treefy(fieldList: HPacketField[]): HPacketField[] {
    const treefiedFields = [];
    fieldList.forEach((x) => {
      const parent: HPacketField = this.findParent(fieldList, x);
      if (parent && !treefiedFields.some((y) => y.id === parent.id)) {
        treefiedFields.push(parent);
      }
    });
    return treefiedFields;
  }

  loadHPackets(): Promise<HPacket[]> {
    if (this.projectId) {
      return new Promise((resolve, reject) => {
          this.hPacketsService
            .findAllHPacketByProjectIdAndType(this.projectId, "INPUT,IO")
            .toPromise()
            .then((res) => {
              this.allPackets = res;
              this.packetOptions = this.allPackets.map((p) => ({
                label: p.name,
                value: p.id,
              }));
              this.cd.detectChanges();
              resolve(this.allPackets);
            });
        });
    }
  }

  buildFieldOptions(hPacket: HPacket): SelectOption[] {
    let fieldList: HPacketField[] = [];
    this.fieldOptions = [];
    this.fieldFlatList = [];
    fieldList = this.treefy(hPacket.fields);
    this.extractField(fieldList);
    return this.fieldFlatList.map((f) => ({
      value: f.label,
      label: f.field.name,
    }));
  }

  addCondition(index) {
    if (this.ruleForms.length === index + 1) {
      this.ruleForms.push({
        form: this.fb.group({}),
        conditionOptions: [],
        compareWith: false,
        fieldOptions:
          this.ruleType === "enrichment"
            ? this.buildFieldOptions(this.currentPacket)
            : [],
      });

      this.cd.detectChanges();
      
      if (this.ruleType === "enrichment") {
        this.ruleForms[index + 1].form
          .get("rulePacket")
          .setValue(this.currentPacket.id);
      }
    }
  }

  removeCondition(index) {
    this.ruleForms.splice(index, 1);
    this.ruleForms[this.ruleForms.length - 1].form.get("ruleJoin").setValue("");
  }

  buildRuleDefinition(): string {
    let rd = "";
    for (const rule of this.ruleForms) {
      const packet: string = rule.form.controls.rulePacket.value
        ? `${rule.form.controls.rulePacket.value}.`
        : "";
      const field: string = rule.form.value.ruleField
        ? rule.form.value.ruleField
        : "";
      const condition: string = rule.form.value.ruleCondition
        ? " " + rule.form.value.ruleCondition
        : "";
      const valueRule: string =
        rule.form.value.ruleValue &&
        rule.form.value.ruleCondition !== "isTrue" &&
        rule.form.value.ruleCondition !== "isFalse"
          ? " " + rule.form.value.ruleValue
          : "";
      const joinRule: string =
        rule.form.value.ruleJoin === " AND " ||
        rule.form.value.ruleJoin === " OR "
          ? rule.form.value.ruleJoin
          : "";
      rd +=
        JSON.stringify(`${packet}${field}`) + condition + valueRule + joinRule;
    }
    return rd;
  }

  packetChanged(event, index) {
    this.loadHPackets().then(packets => {
      this.ruleForms[index].fieldOptions = this.buildFieldOptions(packets.find((y) => y.id === event));
    });
  }

  fieldChanged(event, index) {
    const type = this.fieldFlatList.find((y) => y.label === event.value).field
      .type;
    this.ruleForms[index].conditionOptions = [];

    this.allConditionOptions.forEach((x) => {
      if (x.type.includes(type)) {
        this.ruleForms[index].conditionOptions.push({
          value: x.value,
          label: x.label,
        });
      }
    });
    this.ruleForms[index].compareWith = type !== "BOOLEAN";
  }

  isFormInvalid(k: number): boolean {
    const valArr = this.ruleForms[k].form;
    return Object.entries(valArr.value).length === 0
      ? true
      : valArr.get("ruleField").invalid ||
          valArr.get("ruleCondition").invalid ||
          (this.ruleForms[k].compareWith
            ? valArr.get("ruleValue").invalid
            : false);
  }

  isDirty(): boolean {
    return this.getJsonForms() === "{}" || this.updating
      ? false
      : this.getJsonForms() !== this.originalFormsValues;
  }
  isInvalid(): boolean {
    for (let k = 0; k < this.ruleForms.length; k++) {
      if (this.isFormInvalid(k)) {
        return true;
      }
    }
    return false;
  }

  setRuleDefinition(ruleDefinition: string) {
    if (this.projectId) {
      this.loadHPackets().then((res: HPacket[]) => {
        this.setRuleDef(ruleDefinition);
      });
    }
  }

  setRuleDef(ruleDefinition: string): void {
    this.updating = true;
    const ruleDef: RuleDefinition[] = [];
    this.loadHPackets().then(packets => {
        if (ruleDefinition && ruleDefinition.length !== 0) {
          this.ruleForms = [];
          const ruleArray: string[] =
            ruleDefinition.split(/(?= AND )|(?= OR )/);

          for (let k = 0; k < ruleArray.length; k++) {
            const splitted: string[] = ruleArray[k].split(" ");
            if (k === 0) {
              ruleDef.push({
                packet: JSON.parse(splitted[0]).split(".")[0],
                field: JSON.parse(splitted[0]).substring(
                  splitted[0].indexOf(".")
                ),
                condition: splitted[1],
                value: splitted[2] ? splitted[2] : null,
                join: null,
              });
            } else {
              ruleDef[k - 1].join = splitted[1];
              ruleDef.push({
                packet: JSON.parse(splitted[2]).split(".")[0],
                field: JSON.parse(splitted[2]).substring(
                  splitted[2].indexOf(".")
                ),
                condition: splitted[3],
                value: splitted[4] ? splitted[4] : null,
                join: null,
              });
            }
          }

          for (let k = 0; k < ruleDef.length; k++) {
            const actualPacket: HPacket = packets.find(
              (pa) => pa.id === +ruleDef[k].packet
            );
            if (!actualPacket) {
              const modalRef = this.hytModalService.open(
                RuleErrorModalComponent
              );
              // this.modalService.open('hyt-rule-error-modal');
              this.resetRuleDefinition();
              return;
            }

            const fieldOptions: SelectOption[] =
              this.buildFieldOptions(actualPacket);
            const actualFieldOption: SelectOption = fieldOptions.find(
              (x) => x.value === ruleDef[k].field
            );
            if (!actualFieldOption) {
              this.hytModalService.open(RuleErrorModalComponent);
              this.resetRuleDefinition();
              return;
            }

            const conditionOptions = [];
            const fieldType = this.fieldFlatList.find(
              (ffl) => ffl.label === actualFieldOption.value
            ).field.type;
            this.allConditionOptions.forEach((x) => {
              if (x.type.includes(fieldType)) {
                conditionOptions.push({ value: x.value, label: x.label });
              }
            });

            this.ruleForms.push({
              form: this.fb.group({}),
              conditionOptions,
              compareWith: fieldType !== "BOOLEAN",
              fieldOptions,
            });

            this.cd.detectChanges();

            const rulePacket = this.ruleForms[k].form.get("rulePacket");
            if (rulePacket) {
              rulePacket.setValue(actualPacket.id);
              this.ruleForms[k].form
                .get("ruleField")
                .setValue(actualFieldOption.value);
              this.ruleForms[k].form
                .get("ruleCondition")
                .setValue(ruleDef[k].condition);
              if (this.ruleForms[k].compareWith) {
                this.ruleForms[k].form
                  .get("ruleValue")
                  .setValue(ruleDef[k].value);
              }
              this.ruleForms[k].form
                .get("ruleJoin")
                .setValue(ruleDef[k].join ? " " + ruleDef[k].join + " " : "");
            }
            if (k === this.ruleForms.length - 1) {
              this.originalValueUpdate();
              this.updating = false;
            }
          }
        }
    })
  }

  originalValueUpdate() {
    this.originalFormsValues = this.getJsonForms();
  }

  private getJsonForms() {
    let currentValue = "";
    this.ruleForms.map((rf) => (currentValue += JSON.stringify(rf.form.value)));
    return currentValue;
  }
}
