import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { LoggerService, Logger } from '@hyperiot/core'

import { HPacket, HPacketField, HpacketsService, AreasService, AreaDevice, HDevice } from '@hyperiot/core';
import { UnitConversionService } from 'src/app/services/unit-conversion.service';

export class FieldMatrixConfiguration {
  field: {id: number, name: string};
  map: FieldMatrixMapItem[];
}
export class FieldMatrixMapItem {
  coords: string;
  name: string;
  index: number;
}
export class FieldUnitConversion {
  field: {id: number, name: string};
  convertFrom: string;
  convertTo: string;
  decimals: number;
  options: any[];
}

export class FieldAlias {
  [fieldId: string]: any;
}

@Component({
  selector: 'hyt-packet-select',
  templateUrl: './packet-select.component.html',
  styleUrls: ['./packet-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class PacketSelectComponent implements OnInit {
  @Input() widget;
  @Input()
  selectedPacket: HPacket = null;
  selectedPacketOption: number = null;
  @Input()
  selectedFields: any = [];
  fieldsOption: SelectOption[] = [];
  selectedFieldsOptions: any = [];
  @Output()
  selectedFieldsChange = new EventEmitter();
  projectPackets: HPacket[] = [];
  packetOptions: SelectOption[] = [];
  @Input()
  multiPacketSelect: false;
  @Input()
  areaId: number;
  @Input()
  showFieldsMapping = true;

  packetFieldsMapping: FieldMatrixConfiguration[];
  packetUnitsConversion: FieldUnitConversion[];
  fieldAliases: FieldAlias;
  conversionDecimalsOptions = [
    {label: '0', value: 0},
    {label: '1', value: 1},
    {label: '2', value: 2},
    {label: '3', value: 3},
    {label: '4', value: 4},
    {label: '5', value: 5},
  ];

  aliasesDescription = $localize`:@@HYT_aliases_description:Enter an alternate name to be displayed as column header, in case the alias is empty the field name will be displayed`;

  eventPacketId: number;
  eventPacketTimestampFieldName: string;
  eventPacketFieldName: string;
  offlineTableWidgetType: string;
  private logger: Logger;

  constructor(
    private packetService: HpacketsService,
    public settingsForm: NgForm,
    private areaService: AreasService,
    private unitConversionService: UnitConversionService,
    private loggerService: LoggerService
  ) {
    this.multiPacketSelect = this.multiPacketSelect || false;
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(PacketSelectComponent.name);
  }

  ngOnInit() {
    // If `areaId` is set, then show only packets belonging to the given area devices
    if (this.areaId) {
      this.areaService.getAreaDeviceList(this.areaId).subscribe((areaDevices: AreaDevice[]) => {
        const devices = areaDevices.map((ad: AreaDevice) => ad.device);
        this.loadPackets(devices);
      });
    } else {
      this.loadPackets();
    }

  }

  onPacketChange($event) {
    this.selectedPacket = this.projectPackets.find(p => p.id === $event);
    this.fieldsOption = [];
    this.selectedPacket.fields.map(f => {
      this.fieldsOption.push({
        value: f.name,
        label: f.name
      })
    });
    this.selectedFields = [];
    this.selectedFieldsChange.emit(this.selectedFields);
  }

  onPacketFieldChange($event) {
    this.selectedFields = [];
    if (this.multiPacketSelect) {
      // multiple select
      const nullIndex = this.selectedFields.indexOf(null);
      if (nullIndex >= 0) {
        delete this.selectedFields[nullIndex];
      }
      let selected = $event as any[];
      selected.map(s => {
        this.selectedFields.push(this.selectedPacket.fields.find(p => p.name === s))
      })
    } else {
      // single select
      let selected = $event as any;
      this.selectedFields = this.selectedPacket.fields.find(p => p.name === selected);
    }
    // units conversion
    this.syncUnitsConversion();
    // fields mapping for current packet field
    this.syncFieldMapping();
    this.selectedFieldsChange.emit(this.selectedFields);
  }

  onPacketUnitConversionChange(unit, i) {
    this.packetUnitsConversion[i].convertTo = unit;
  }

  onAddFieldMapping(fieldMatrix: FieldMatrixConfiguration) {
    fieldMatrix.map.push(new FieldMatrixMapItem());
  }
  onDeleteFieldMapping(fieldMatrix: FieldMatrixConfiguration, mapIndex: number) {
    fieldMatrix.map.splice(mapIndex, 1);
  }
  onFieldMappingChange(fieldMap: FieldMatrixMapItem, value: string) {
    fieldMap.name = value;
  }

  apply() {
    if (this.selectedPacketOption) {
      this.selectedPacket = this.projectPackets.find(p => p.id === +this.selectedPacketOption);
      this.widget.config.packetId = this.selectedPacket.id;
      this.widget.config.timestampFieldName = this.selectedPacket.timestampField;
      this.widget.config.packetFields = {};
      if (!this.multiPacketSelect) {
        this.selectedFields = [ this.selectedFields ];
      }
      this.selectedFields.map((pf) => this.widget.config.packetFields[pf.id] = pf.name);
      this.widget.config.packetFieldsMapping = this.packetFieldsMapping;
      this.widget.config.packetUnitsConversion = this.packetUnitsConversion;
      this.widget.config.fieldAliases = this.fieldAliases;
      this.logger.debug('Saving widget congiguration:', this.widget.config);
    }
  }

  // packetCompare(p1: HPacket, p2: HPacket) {
  //   return p1 != null && p2 != null && p1.id === p2.id;
  // }

  packetCompare($event) {
    console.log('packetCompare ' + JSON.stringify($event));
    return $event.o1 != null && $event.o2 != null && $event.o1.value === $event.o2.value;
  }

  loadPackets(devices?: HDevice[]) {
    this.packetFieldsMapping = this.widget.config.packetFieldsMapping ?
        JSON.parse(JSON.stringify(this.widget.config.packetFieldsMapping)) : [];
    this.packetUnitsConversion = this.widget.config.packetUnitsConversion ?
        JSON.parse(JSON.stringify(this.widget.config.packetUnitsConversion)) : [];
    this.fieldAliases = this.widget.config.fieldAliases ?
        JSON.parse(JSON.stringify(this.widget.config.fieldAliases)) : { };
    // fetch all packets
    this.packetService
      .findAllHPacketByProjectIdAndType(this.widget.projectId,"INPUT,IO")
      .subscribe((packetList) => {
        // Filter out packets not belonging to the given `devices` list (if set)
        if (devices) {
          packetList = packetList.filter((p: HPacket) => {
            if (p.device && devices.find(d => d.id === p.device.id)) {
              return p;
            }
          });
        }
        this.projectPackets = packetList;
        this.projectPackets.map((p) => {
          this.packetOptions.push({
            value: p.id,
            label: p.name
          })
        });

        this.packetOptions.sort((a, b) => a.label < b.label ? -1 : 1);
        this.projectPackets.sort((a, b) => a.name < b.name ? -1 : 1)
 
        const w = this.widget;
        // load curent packet data and set selected fields
        if (w.config && w.config.packetId) {
          this.packetService.findHPacket(w.config.packetId)
            .subscribe((packet: HPacket) => {
              this.selectedPacket = packet;
              this.selectedPacketOption = this.selectedPacket.id;
              this.selectedPacket.fields.map(f => {
                this.fieldsOption.push({
                  value: f.name,
                  label: f.name
                })
              });
              if (this.widget.config.packetFields) {
                this.selectedFields = [];
                packet.fields.map((pf) => {
                  if (this.widget.config.packetFields[pf.id]) {
                    if (this.multiPacketSelect) {
                      this.selectedFieldsOptions.push(pf.name);
                      this.selectedFields.push(pf);
                    } else {
                      this.selectedFieldsOptions = pf.name;
                      this.selectedFields = pf;
                    }
                  }
                })
                packet.fields.sort((a, b) => a.name < b.name ? -1 : 1);
                this.syncUnitsConversion();
                this.syncFieldMapping();
              }
            });
        }
      });
  }

  hasFieldsUnit() {
    return true;
    /*
      Condition commented out as not working correctly when only one field is selected.
    */
    // if (this.multiPacketSelect) {
    //   if (this.selectedFields.length === 0) {
    //     return 0;
    //   }
    //   const unitCount = this.selectedFields.reduce((a, b) => (a + b.unit ? 1 : 0));
    //   if (unitCount > 0)
    //     console.log('unitCount > 0 ');
    //   else
    //     console.log('unitCount < 0 ');
    //   return unitCount > 0;
    // }
    // return this.selectedFields.unit;
  }

  private syncUnitsConversion() {
    if (!this.packetUnitsConversion) {
      this.packetUnitsConversion = [];
    }
    const tempMap = [] as FieldUnitConversion[];
    const addFieldConversion = (f: HPacketField) => {
      let unit = null
      let unitConvert = this.packetUnitsConversion.find((uc) => uc.field.id === f.id);
      unit = (f.unit == "")?null:f.unit;
      if (!unitConvert) {
        unitConvert = {
          field: {id: f.id, name: f.name},
          convertFrom: unit,
          convertTo: unit,
          decimals: 1,
          options: this.getUnitOptions(unit)
        };
        if (!tempMap.includes(unitConvert))
          tempMap.push(unitConvert);
      } else {
        unitConvert.convertFrom = unit;
        if (!tempMap.includes(unitConvert))
          tempMap.push(unitConvert);
      }
      unitConvert.field.name = f.name;
    };
    if (this.multiPacketSelect) {
      this.selectedFields.map((pf: HPacketField) => {
        addFieldConversion(pf);
      });
    } else if (this.selectedFields) {
      addFieldConversion(this.selectedFields);
    }
    this.packetUnitsConversion = tempMap;
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

  private syncFieldMapping() {
    if (!this.packetFieldsMapping) {
      this.packetFieldsMapping = [];
    }
    if (!this.multiPacketSelect) {
      return;
    }
    const tempMap = [] as FieldMatrixConfiguration[];
    this.selectedFields.map((pf: HPacketField) => {
      if (pf.multiplicity === HPacketField.MultiplicityEnum.ARRAY || pf.multiplicity === HPacketField.MultiplicityEnum.MATRIX) {
        const fieldMapping = this.packetFieldsMapping.find((f) => f.field.id === pf.id);
        if (!fieldMapping) {
          const af = new FieldMatrixConfiguration();
          af.field = {id: pf.id, name: pf.name};
          af.map = [] as FieldMatrixMapItem[];
          tempMap.push(af);
        } else {
          fieldMapping.field.name = pf.name;
          tempMap.push(fieldMapping);
        }
      }
    });
    this.packetFieldsMapping = tempMap;
  }

}
