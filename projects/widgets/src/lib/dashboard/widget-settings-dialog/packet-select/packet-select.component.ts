import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { SelectOption, SelectOptionGroup, UnitConversionService } from 'components';
import { LoggerService, Logger, HPacketFieldsHandlerService } from 'core';
import { HPacket, HPacketField, HpacketsService, AreasService, AreaDevice, HDevice } from 'core';
import { mimeTypeList } from './MIMETypes';
import { FieldAliases, FieldFileMimeTypes, FieldTypes, FieldUnitConversion, FieldValuesMapList } from '../../../base/base-widget/model/widget.model';

@Component({
  selector: 'hyperiot-packet-select',
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
  groupedPacketOptions: SelectOptionGroup[] = [];
  @Input()
  multiPacketSelect = false;
  @Input()
  areaId: number;

  fieldAliases: FieldAliases;
  fieldTypes: FieldTypes;
  fieldFileMimeTypes: FieldFileMimeTypes;
  fieldUnitConversions: FieldUnitConversion;
  conversionDecimalsOptions = [
    {label: '0', value: 0},
    {label: '1', value: 1},
    {label: '2', value: 2},
    {label: '3', value: 3},
    {label: '4', value: 4},
    {label: '5', value: 5},
  ];
  fieldValuesMapList: FieldValuesMapList;

  aliasesDescription = $localize`:@@HYT_aliases_description:Enter an alternative name to be displayed in the widget. If the alias is empty, the field name will be displayed.`;

  allMIMETypesOptions: string[] = mimeTypeList;
  filteredMIMETypesOptions: string[];

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
    private loggerService: LoggerService,
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService,
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
    this.filteredMIMETypesOptions = [...this.allMIMETypesOptions];

  }

  onPacketChange(packetOption) {
    this.selectedPacketOption = packetOption.value;
    this.selectedPacket = this.projectPackets.find(p => p.id === this.selectedPacketOption);
    this.fieldsOption = [];
    const fieldsFlatList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.selectedPacket);
    this.fieldsOption = fieldsFlatList.map(x => ({
      value: x.field.id,
      label: x.label
    }));
    this.selectedFields = [];
    this.selectedFieldsOptions = [];
    this.selectedFieldsChange.emit(this.selectedFields);
  }

  onPacketFieldChange($event) {
    this.selectedFields = [];
    // if (this.multiPacketSelect) {
      // multiple select
      const nullIndex = this.selectedFields.indexOf(null);
      if (nullIndex >= 0) {
        delete this.selectedFields[nullIndex];
      }
      let selected = $event as any[];
      selected.map(s => {
        // this.selectedFields.push(this.selectedPacket.fields.find(p => p.name === s))
        this.selectedFields.push(this.hPacketFieldsHandlerService.findFieldFromPacketFieldsTree(this.selectedPacket, s));
      })
    // } else {
      // single select
      // let selected = $event as any;
      // this.selectedFields = this.selectedPacket.fields.find(p => p.name === selected);
      // this.selectedFields.push(this.hPacketFieldsHandlerService.findFieldFromPacketFieldsTree(this.selectedPacket, selected));
    // }
    // units conversion
    this.syncUnitsConversion();
    this.selectedFieldsChange.emit(this.selectedFields);
  }

  apply() {
    if (this.selectedPacketOption) {
      this.selectedPacket = this.projectPackets.find(p => p.id === +this.selectedPacketOption);
      this.widget.config.packetId = this.selectedPacket.id;
      this.widget.config.timestampFieldName = this.selectedPacket.timestampField;
      this.widget.config.packetFields = {};
      // if (!this.multiPacketSelect) {
      //   this.selectedFields = [ this.selectedFields ];
      // }
      // this.selectedFields.map((pf) => this.widget.config.packetFields[pf.id] = pf.name);
      this.selectedFields.map((pf) => this.widget.config.packetFields[pf.id] = this.hPacketFieldsHandlerService.getStringifiedSequenceFromPacket(this.selectedPacket, pf.id));
      this.widget.config.fieldAliases = this.fieldAliases;
      this.widget.config.fieldFileMimeTypes = this.fieldFileMimeTypes;
      this.widget.config.fieldTypes = { };
      this.widget.config.fieldUnitConversions = this.fieldUnitConversions;
      this.widget.config.fieldValuesMapList = this.fieldValuesMapList;
      // this.selectedPacket.fields.forEach(field => {
      //   this.widget.config.fieldTypes[field.id] = field.type;
      // });
      this.selectedFields.forEach(pf => {
        const field = this.hPacketFieldsHandlerService.findFieldFromPacketFieldsTree(this.selectedPacket, pf.id);
        this.widget.config.fieldTypes[field.id] = field.type;
      });
      this.logger.debug('Saving widget congiguration:', this.widget.config);
    }
  }

  // packetCompare(p1: HPacket, p2: HPacket) {
  //   return p1 != null && p2 != null && p1.id === p2.id;
  // }

  packetCompare($event) {
    return $event.o1 != null && $event.o2 != null && $event.o1.value === $event.o2.value;
  }

  loadPackets(devices?: HDevice[]) {
    this.fieldAliases = this.widget.config.fieldAliases ?
        JSON.parse(JSON.stringify(this.widget.config.fieldAliases)) : { };
    this.fieldFileMimeTypes = this.widget.config.fieldFileMimeTypes ?
        JSON.parse(JSON.stringify(this.widget.config.fieldFileMimeTypes)) : { };
    this.fieldUnitConversions = this.widget.config.fieldUnitConversions ?
        JSON.parse(JSON.stringify(this.widget.config.fieldUnitConversions)) : { };
    this.fieldValuesMapList = this.widget.config.fieldValuesMapList ?
        JSON.parse(JSON.stringify(this.widget.config.fieldValuesMapList)) : { };
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
        this.projectPackets.sort((a, b) => a.name < b.name ? -1 : 1);

        const packetDevices = this.projectPackets.map((x) => x.device);
        const groupDevices = [];
        packetDevices.forEach((x) => {
          if (!groupDevices.some((y) => y.id === x.id)) {
            groupDevices.push(x);
          }
        });
        this.groupedPacketOptions = groupDevices.map((x) => ({
          name: x.deviceName,
          options: this.projectPackets
            .filter((y) => y.device.id === x.id)
            .map((y) => ({
              value: y.id,
              label: y.name,
              icon: 'icon-hyt_packets',
            })),
          icon: 'icon-hyt_device',
        }));

        const w = this.widget;
        // load curent packet data and set selected fields
        if (w.config && w.config.packetId) {
          this.packetService.findHPacket(w.config.packetId)
            .subscribe((packet: HPacket) => {
              this.selectedPacket = packet;
              this.selectedPacketOption = this.selectedPacket.id;
              const fieldsFlatList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.selectedPacket);
              this.fieldsOption = fieldsFlatList.map(x => ({
                value: x.field.id,
                label: x.label
              }));
              if (this.widget.config.packetFields) {
                this.selectedFields = [];
                Object.keys(this.widget.config.packetFields).forEach(x => {
                  this.selectedFieldsOptions.push(+x);
                  this.selectedFields.push(this.hPacketFieldsHandlerService.findFieldFromPacketFieldsTree(packet, +x));
                });
                // packet.fields.map((pf) => {
                //   if (this.widget.config.packetFields[pf.id]) {
                //     if (this.multiPacketSelect) {
                //       this.selectedFieldsOptions.push(pf.id);
                //       this.selectedFields.push(pf);
                //     } else {
                //       this.selectedFieldsOptions = pf.id;
                //       this.selectedFields = pf;
                //     }
                //   }
                // })
                packet.fields.sort((a, b) => a.name < b.name ? -1 : 1);
                this.syncUnitsConversion();
              }
            });
        }
      });
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
      this.selectedFields.filter(field => field.type === 'INTEGER' || field.type === 'FLOAT' || field.type === 'DOUBLE').map((pf: HPacketField) => {
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

  filterMimeTypeList(fieldId) {
    if (this.fieldFileMimeTypes[fieldId]) {
      this.filteredMIMETypesOptions = this.allMIMETypesOptions.filter(option => option.toLowerCase().includes(this.fieldFileMimeTypes[fieldId].toLowerCase()));
    } else {
      this.filteredMIMETypesOptions = [...this.allMIMETypesOptions];
    }
  }

  getFullFieldName(hPacketFieldId) {
    return this.hPacketFieldsHandlerService.getStringifiedSequenceFromPacket(this.selectedPacket, hPacketFieldId);
  }

}
