import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { HProjectAlgorithmsService, HProjectAlgorithm, HPacketField } from 'core';
import { FieldAliases, FieldTypes, FieldUnitConversion } from '../../../../base/base-widget/model/widget.model';
import { UnitConversionService } from 'components';


@Component({
  selector: 'hyperiot-algorithm-select',
  templateUrl: './algorithm-select.component.html',
  styleUrls: ['./algorithm-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class AlgorithmSelectComponent implements OnInit {

  @Input() widget;
  @Input() selectedHProjectAlgorithm: HProjectAlgorithm = null;
  conversionDecimalsOptions = [
    {label: '0', value: 0},
    {label: '1', value: 1},
    {label: '2', value: 2},
    {label: '3', value: 3},
    {label: '4', value: 4},
    {label: '5', value: 5},
  ];

  hProjectAlgorithmList: HProjectAlgorithm[] = [];

  outputFields = [];
  fieldAliases: FieldAliases;
  fieldTypes: FieldTypes;
  fieldUnitConversions: FieldUnitConversion;

  constructor(
    private hProjectAlgorithmsService: HProjectAlgorithmsService,
    private unitConversionService: UnitConversionService,
    public settingsForm: NgForm
  ) { }

  ngOnInit() {
    this.fieldAliases = this.widget.config.fieldAliases ?
        JSON.parse(JSON.stringify(this.widget.config.fieldAliases)) : { };
    this.fieldUnitConversions = this.widget.config.fieldUnitConversions ?
        JSON.parse(JSON.stringify(this.widget.config.fieldUnitConversions)) : { };
    this.loadAlgorithms();
  }

  onAlgorithmChange() {
    // resetting alias and unit conversion because multiple fields may have same id
    this.fieldAliases = { };
    this.fieldUnitConversions = { };
    this.setOutputFields();
  }


  apply() {
    if (this.selectedHProjectAlgorithm) {
      this.widget.config.hProjectAlgorithmId = this.selectedHProjectAlgorithm.id;
      this.widget.config.hProjectAlgorithmName = this.selectedHProjectAlgorithm.name;
      this.widget.config.fieldAliases = this.fieldAliases;
      this.widget.config.fieldUnitConversions = this.fieldUnitConversions;
      this.widget.config.packetFields = { };
      this.widget.config.fieldTypes = { };
      this.outputFields.forEach(pf => {
        this.widget.config.packetFields[pf.id] = pf.name;
        this.widget.config.fieldTypes[pf.id] = pf.fieldType;
      });
    }
  }

  algorithmCompare(a1: HProjectAlgorithm, a2: HProjectAlgorithm) {
    return a1 != null && a2 != null && a1.id === a2.id;
  }

  loadAlgorithms() {
    // fetch all algorithms
    this.hProjectAlgorithmsService.findByHProjectId(this.widget.projectId)
      .subscribe( hProjectAlgorithmList => {
        this.hProjectAlgorithmList = hProjectAlgorithmList;
        if (this.widget.config && this.widget.config.hProjectAlgorithmId) {
          // set previous algorithm if widget has been already configured
          this.selectedHProjectAlgorithm =
            this.hProjectAlgorithmList.find(x => x.id === this.widget.config.hProjectAlgorithmId)
          this.setOutputFields();
        }
      });
  }

  private setOutputFields() {
    try {
      this.outputFields = JSON.parse(this.selectedHProjectAlgorithm.config).output;
    } catch(error) {
      console.error('Unable to get selected algorithm outputFields. Disabled fields config ');
      this.outputFields = [];
    }
    this.syncUnitsConversion();
  }

  private syncUnitsConversion() {
    const addFieldConversion = (f: HPacketField) => {
      let unit = null
      let unitConvert = this.fieldUnitConversions[f.id];
      unit = (f.unit == "")?null:f.unit;
      if (!unitConvert) {
        unitConvert = {
          convertFrom: unit,
          convertTo: unit,
          decimals: 1,
          options: this.getUnitOptions(unit),
          conversionCustomLabel: '',
        };
      } else {
        unitConvert.convertFrom = unit;
      }
      this.fieldUnitConversions[f.id] = unitConvert;
    };
    // if (this.multiPacketSelect) {
      this.outputFields.filter(field => field.fieldType === 'NUMBER' || field.fieldType === 'INTEGER' || field.fieldType === 'FLOAT' || field.fieldType === 'DOUBLE').map((pf: HPacketField) => {
        addFieldConversion(pf);
      });
    // } else if (this.selectedFields) {
    //   addFieldConversion(this.selectedFields);
    // }
  }

  getUnit(unit: string) {
    if(!unit)
      return "";
    return this.unitConversionService.convert().describe(unit);
  }

  private getUnitOptions(unit: string): any[] {
    if(!unit)
      return [];
    const measurement = this.getUnit(unit);
    const measurementUnit = UnitConversionService.measurements.find((m) => m.type === measurement.measure);
    const unitOptions = [];
    if (measurementUnit && measurementUnit.list) {
      unitOptions.push(...measurementUnit.list
        .map((u) => ({
          label: `${u.plural} (${u.abbr})`,
          value: u.abbr
        })).sort((a, b) => a.label < b.label ? -1 : 1)
      );
    }
    return unitOptions;
  }

}
