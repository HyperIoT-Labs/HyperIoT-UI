import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ViewEncapsulation,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { SelectOption, SelectOptionGroup, UnitConversionService } from 'components';
import { LoggerService, Logger, HPacketFieldsHandlerService } from 'core';
import { HPacket, HPacketField, HpacketsService, AreasService, AreaDevice, HDevice, HdevicesService } from 'core';
import { mimeTypeList } from './MIMETypes';
import { FieldAliases, FieldFileMimeTypes, FieldTypes, FieldUnitConversion, FieldValuesMapList } from '../../../base/base-widget/model/widget.model';
import { DataSimulatorSettings } from "../data-simulator-settings/data-simulator.models";
import { $localize } from "@angular/localize/init";
import { PageStatus } from '../models/page-status';

@Component({
  selector: 'hyperiot-packet-select',
  templateUrl: './packet-select.component.html',
  styleUrls: ['./packet-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class PacketSelectComponent implements OnInit, OnChanges {
  @Input() widget;
  @Input()
  selectedPacket: HPacket = null;
  selectedPacketOption: number = null;

  /** Represents the current page status (e.g., LOADING, READY, ERROR). */
  pageStatus: PageStatus = PageStatus.Loading;
  @Output()
  pageStatusChange: EventEmitter<number> | undefined = new EventEmitter<number>();

  dynamicLabelSelectedPacket: { [id: number]: HPacket } = {};

  dynamicLabelFields: { [id: number]: HPacketField[] } = {};
  dynamicLabelSelectedPacketOption: { [id: number]: number } = {};
  @Input()
  selectedFields: any = [];
  fieldsOption: SelectOption[] = [];
  selectedFieldsOptions: any = [];
  dynamicLabelSelectedField: { [id: number]: { fieldId?: number, fieldName?: string } } = {};
  dynamicLabelFieldsOption: SelectOption[] = [];
  @Output()
  selectedFieldsChange = new EventEmitter();
  projectPackets: HPacket[] = [];
  groupedPacketOptions: SelectOptionGroup[] = [];
  @Input()
  multiPacketSelect = false;
  @Input()
  areaId: number;
  @Input() hDeviceId: number;
  @Input() spinner: boolean = false;
  @Input() chartStatus?: PageStatus;

  fieldAliases: FieldAliases;
  fieldTypes: FieldTypes;
  fieldFileMimeTypes: FieldFileMimeTypes;
  fieldUnitConversions: FieldUnitConversion;
  conversionDecimalsOptions = [
    { label: '0', value: 0 },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
  ];
  fieldValuesMapList: FieldValuesMapList;

  aliasesDescription = $localize`:@@HYT_aliases_description:Enter an alternative name to be displayed in the widget. If the alias is empty, the field name will be displayed.`;
  dynamicLabelDescription = $localize`:@@HYT_dynamic_label_description:Dynamic Label: The registered value of this label will be displayed beneath the main field label.`;

  allMIMETypesOptions: string[] = mimeTypeList;
  filteredMIMETypesOptions: string[];

  eventPacketId: number;
  eventPacketTimestampFieldName: string;
  eventPacketFieldName: string;
  offlineTableWidgetType: string;
  private logger: Logger;
  fitToTimelineCheckbox = false;
  widgetType: string;

  fieldRules: DataSimulatorSettings.FieldRules = {};
  expressionIsValid: boolean = true;

  constructor(
    private packetService: HpacketsService,
    public settingsForm: NgForm,
    private areaService: AreasService,
    private hDeviceService: HdevicesService,
    private unitConversionService: UnitConversionService,
    private loggerService: LoggerService,
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService,
  ) {
    this.multiPacketSelect = this.multiPacketSelect || false;
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(PacketSelectComponent.name);
  }

  ngOnInit() {
    this.pageStatus = PageStatus.Loading;
    this.pageStatusChange.emit(this.pageStatus);
    // If `areaId` is set, then show only packets belonging to the given area devices
    if (this.areaId) {
      this.areaService.getAreaDeviceList(this.areaId).subscribe((areaDevices: AreaDevice[]) => {
        const devices = areaDevices.map((ad: AreaDevice) => ad.device);
        this.loadPackets(devices);
      });
    } else if (this.hDeviceId) {
      this.hDeviceService.findHDevice(this.hDeviceId).subscribe((hDevice: HDevice) => {
        this.loadPackets([hDevice]);
      });
    } else {
      this.loadPackets();
    }
    this.filteredMIMETypesOptions = [...this.allMIMETypesOptions];

    // Set widget type, used to show/hide fit to timeline checkbox
    this.widgetType = this.widget.type;
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

  onDynamicLabelPacketSelect(packetOption, fieldId) {
    this.dynamicLabelSelectedPacketOption[fieldId] = packetOption.value;
    this.dynamicLabelSelectedPacket[fieldId] = this.projectPackets.find(p => p.id === this.dynamicLabelSelectedPacketOption[fieldId]);
    this.dynamicLabelFields[fieldId] = this.dynamicLabelSelectedPacket[fieldId].fields;
    this.dynamicLabelFieldsOption = [];
    const fieldsFlatList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.dynamicLabelSelectedPacket[fieldId] as HPacket);
    this.dynamicLabelFieldsOption = fieldsFlatList.map(x => ({
      value: x.field.id,
      label: x.label
    }));
    this.dynamicLabelSelectedField[fieldId] = {};
  }

  onDynamicLabelPacketFieldSelect($event, fieldId) {
    if ($event.length > 0) {
      this.dynamicLabelSelectedField[fieldId] = { fieldId: $event, fieldName: this.dynamicLabelFields[fieldId].find(field => field.id === $event[0]).name };
    } else {
      delete this.dynamicLabelSelectedField[fieldId];
    }
  }

  onPacketFieldChange($event) {
    this.selectedFields = [];

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

    // units conversion
    this.syncUnitsConversion();
    // field custom conversion
    this.syncFieldCustomConversion();
    this.selectedFieldsChange.emit(this.selectedFields);
  }

  apply() {
    if (this.selectedPacketOption) {
      this.selectedPacket = this.projectPackets.find(p => p.id === +this.selectedPacketOption);
      this.widget.config.packetId = this.selectedPacket.id;
      this.widget.config.timestampFieldName = this.selectedPacket.timestampField;
      this.widget.config.packetFields = {};

      this.selectedFields.map((pf) => {
        this.widget.config.packetFields[pf.id] = this.hPacketFieldsHandlerService.getStringifiedSequenceFromPacket(this.selectedPacket, pf.id)
      });
      this.widget.config.fieldAliases = this.fieldAliases;
      this.widget.config.fieldFileMimeTypes = this.fieldFileMimeTypes;
      this.widget.config.fieldTypes = {};
      this.widget.config.fieldUnitConversions = this.fieldUnitConversions;
      this.widget.config.fieldValuesMapList = this.fieldValuesMapList;
      this.widget.config.dynamicLabels = {
        packet: this.dynamicLabelSelectedPacket,
        packetOption: this.dynamicLabelSelectedPacketOption,
        field: this.dynamicLabelSelectedField,
        fieldOptions: this.dynamicLabelFields
      }

      this.widget.config.fieldCustomConversions = this.fieldRules;
      this.widget.config.fitToTimeline = this.fitToTimelineCheckbox;


      this.selectedFields.forEach(pf => {
        const field = this.hPacketFieldsHandlerService.findFieldFromPacketFieldsTree(this.selectedPacket, pf.id);
        this.widget.config.fieldTypes[field.id] = field.type;
      });
      this.logger.debug('Saving widget congiguration:', this.widget.config);
    }
  }

  packetCompare($event) {
    return $event.o1 != null && $event.o2 != null && $event.o1.value === $event.o2.value;
  }

  loadPackets(devices?: HDevice[]) {
    this.fieldAliases = this.widget.config.fieldAliases ?
      JSON.parse(JSON.stringify(this.widget.config.fieldAliases)) : {};
    this.fieldFileMimeTypes = this.widget.config.fieldFileMimeTypes ?
      JSON.parse(JSON.stringify(this.widget.config.fieldFileMimeTypes)) : {};
    this.fieldUnitConversions = this.widget.config.fieldUnitConversions ?
      JSON.parse(JSON.stringify(this.widget.config.fieldUnitConversions)) : {};
    this.fieldValuesMapList = this.widget.config.fieldValuesMapList ?
      JSON.parse(JSON.stringify(this.widget.config.fieldValuesMapList)) : {};
    this.fieldRules = this.widget.config.fieldCustomConversions ?
      JSON.parse(JSON.stringify(this.widget.config.fieldCustomConversions)) : {};
    this.fitToTimelineCheckbox = this.widget.config.fitToTimeline || false;
    // fetch all packets
    this.packetService
      .findAllHPacketByProjectIdAndType(this.widget.projectId, "INPUT,IO")
      .subscribe({
        next: (packetList) => {
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
              .subscribe({
                next: (packet: HPacket) => {
                  this.pageStatus = PageStatus.Ready;
                  this.pageStatusChange.emit(this.pageStatus);
                  this.selectedPacket = packet;
                  this.selectedPacketOption = this.selectedPacket.id;
                  this.dynamicLabelSelectedPacket = this.widget.config.dynamicLabels.packet;
                  this.dynamicLabelSelectedPacketOption = this.widget.config.dynamicLabels.packetOption;
                  this.dynamicLabelFields = this.widget.config.dynamicLabels.fieldOptions;
                  this.dynamicLabelSelectedField = this.widget.config.dynamicLabels.field;
                  const fieldsFlatList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.selectedPacket);
                  this.fieldsOption = fieldsFlatList.map(x => ({
                    value: x.field.id,
                    label: x.label
                  }));
                  Object.entries(this.widget.config.packetFields).forEach((v, k) => {
                    if (!this.fieldRules[v[0]]) {
                      this.fieldRules[v[0]] = { type: 'expression', expression: '' };
                    }
                  });
                  if (this.widget.config.packetFields) {
                    this.selectedFields = [];
                    Object.keys(this.widget.config.packetFields).forEach(x => {
                      this.selectedFieldsOptions.push(+x);
                      this.selectedFields.push(this.hPacketFieldsHandlerService.findFieldFromPacketFieldsTree(packet, +x));
                    });
                    packet.fields.sort((a, b) => a.name < b.name ? -1 : 1);
                    this.syncUnitsConversion();
                  }
                },
                error: (error) => {
                  this.pageStatus = PageStatus.Error;
                  this.pageStatusChange.emit(this.pageStatus);
                  this.logger.error('Error loading packet:', error);
                }
              });
          } else {
            this.pageStatus = PageStatus.Ready;
            this.pageStatusChange.emit(this.pageStatus);
          }
        },
        error: (error) => {
          this.pageStatus = PageStatus.Error;
          this.pageStatusChange.emit(this.pageStatus);
          this.logger.error('Error loading packet:', error);
        }
      });
  }

  private syncUnitsConversion() {
    const addFieldConversion = (f: HPacketField) => {
      let unit = null
      let unitConvert = this.fieldUnitConversions[f.id];
      unit = (f.unit == "") ? null : f.unit;
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
    this.selectedFields.filter(field => field.type === 'INTEGER' || field.type === 'FLOAT' || field.type === 'DOUBLE').map((pf: HPacketField) => {
      addFieldConversion(pf);
    });
  }

  getUnit(unit: string) {
    if (!unit)
      return "";
    return this.unitConversionService.convert().describe(unit);
  }

  private getUnitOptions(unit: string): any[] {
    if (!unit)
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

  updateExpression(ev, fieldId) {
    let expression: string = ev.target.value;
    expression = expression.replace(',', '.');
    this.fieldRules[fieldId] = { type: 'expression', expression };
    try {
      for (let operator of DataSimulatorSettings.Utils
        .expressionOperators) {
        expression = expression.replace(
          operator.regex,
          operator.function
        );
      }
      const result = eval(expression.replace(/\$val/g, '2'));
      this.logger.debug('expression is valid', expression.replace(/\$val/g, '2'), result);
      this.expressionIsValid = true;
      this.settingsForm.controls['expression' + fieldId].setErrors(null);
    } catch (error) {
      this.logger.debug('expression is not valid', expression.replace(/\$val/g, '2'));
      this.expressionIsValid = false;
      this.settingsForm.controls['expression' + fieldId].setErrors({ 'incorrect': true });
    }
    this.logger.debug(this.fieldRules);
  }

  private syncFieldCustomConversion() {
    this.selectedFields.map((sf) => {
      if (!this.fieldRules[sf.id]) {
        this.fieldRules[sf.id] = { type: 'expression', expression: '' };
      }
    });
    Object.entries(this.fieldRules).forEach((v, k) => {
      if (!this.selectedFields.find(f => f.id === +v[0])) {
        delete this.fieldRules[+v[0]];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hDeviceId) {
      this.hDeviceId = changes.hDeviceId.currentValue;
    }
  }
}
