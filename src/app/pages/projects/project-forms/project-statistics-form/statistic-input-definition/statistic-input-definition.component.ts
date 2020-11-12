import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { HPacket, HPacketField, HpacketsService, HProject } from '@hyperiot/core';

interface StatisticInputForm {
  form: FormGroup;
  fieldOptions: SelectOption[];
}

interface FieldList {
  field: HPacketField;
  label: string;
}

@Component({
  selector: 'hyt-statistic-input-definition',
  templateUrl: './statistic-input-definition.component.html',
  styleUrls: ['./statistic-input-definition.component.scss']
})
export class StatisticInputDefinitionComponent implements OnInit, OnChanges {

  @Input() project: HProject;

  allPackets: HPacket[] = [];
  fieldOptions: SelectOption[] = [];
  fieldFlatList: FieldList[] = [];
  packetOptions: SelectOption[] = [];
  statisticInputForms: StatisticInputForm[] = [];

  private originalFormsValues = '{"packet":"","field":""}';

  constructor(
    private hPacketsService: HpacketsService,
    public fb: FormBuilder
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.loadHPackets();
  }

  addStatisticInput() {
    this.statisticInputForms.push({
      form: this.fb.group({}),
      fieldOptions: []
    });
  }

  buildFieldOptions(hPacket: HPacket): SelectOption[] {
    let fieldList: HPacketField[] = [];
    this.fieldOptions = [];
    this.fieldFlatList = [];
    fieldList = this.treefy(hPacket.fields);
    this.extractField(fieldList);
    return this.fieldFlatList.map(f => ({ value: f.label, label: f.field.name }));
  }

  extractField(fieldArr: HPacketField[], pre?: string) {
    fieldArr.forEach(f => {
      const fieldName: string = pre ? pre + '.' + f.name : f.name;
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

  loadHPackets() {
    if (this.project) {
      this.hPacketsService.findAllHPacketByProjectId(this.project.id).subscribe(
        (res: HPacket[]) => {
          this.allPackets = res;
          this.packetOptions = this.allPackets.map(p => ({ label: p.name, value: p.id }));
          this.resetRuleDefinition();
        }
      );
    }
  }

  packetChanged(event, index) {
    this.statisticInputForms[index].fieldOptions = this.buildFieldOptions(this.allPackets.find(y => y.id === event));
  }

  removeStatisticInput(index) {
    this.statisticInputForms.splice(index, 1);
  }

  resetRuleDefinition(): void {
    this.statisticInputForms = [{
      form: this.fb.group({}),
      fieldOptions: []
    }];
    this.originalFormsValues = '{"packet":"","field":""}';
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

}
