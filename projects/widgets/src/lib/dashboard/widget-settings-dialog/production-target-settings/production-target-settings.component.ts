import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { SelectOptionGroup } from 'components';
import { HPacket, HPacketField, HPacketService, Logger, LoggerService } from 'core';
import { Observable } from 'rxjs';
import { FieldAliases, WidgetConfig } from '../../../base/base-widget/model/widget.model';
import { ProductionTargetSettings } from './production-target.model';

@Component({
  selector: 'hyperiot-production-target-settings',
  templateUrl: './production-target-settings.component.html',
  styleUrls: ['./production-target-settings.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class ProductionTargetSettingsComponent implements OnInit {
  @Input() widget: WidgetConfig;
  @Input() areaId;
  @Input() modalApply: Observable<any>;
  @Input() settingsForm: NgForm;
  @Input() hDeviceId;

  private logger: Logger;

  /**
   * Boolean used to display content when loaded
   */
  contentLoaded: boolean = false;

  /**
   * Radio button options
   */
  isTargetManuallySetOptions = [
    { value: 'true', label: 'Set Manually', checked: true },
    { value: 'false', label: 'Set Dynamically', checked: false }
  ];
  isTargetOptionManual: boolean = true;
  targetValue: number = null;

  fieldAliases: FieldAliases = {};

  subscription: any;
  allPackets: HPacket[] = [];
  groupedPacketOptions: SelectOptionGroup[] = [];

  selectedPackets: { [key: string]: HPacket } = {};
  selectedPacketsOption: { [key: string]: number } = {};
  selectedFields: { [id: number]: { fieldId?: number, fieldName?: string } } = {};
  fieldsOptions: { [key: string]: HPacketField[] } = {};
  settableParameters: string[] = ['target', 'produced', 'current_shift'];

  constructor(
    loggerService: LoggerService,
    private hPacketsService: HPacketService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("ProductionTargetSettingsComponent");
  }

  ngOnInit(): void {
    if (this.widget.config == null) {
      this.widget.config = {};
    }

    if (this.widget.config.colors == null) {
      this.widget.config.colors = {};
    }

    if (!this.widget.config) {
      Object.assign(this.widget.config);
    }

    this.subscription = this.modalApply.subscribe((event) => {
      if (event === 'apply') {
        this.apply();
      }
    });
    this.retrievePacketsAndFields();
  }

  /**
   * Saves target manually setted value
   * @param inputValue
   */
  updateTargetValue(inputValue: number) {
    this.targetValue = inputValue;
  }

  /**
   * Called when radio button value is changed
   * @param option
   */
  onTargetOptionChange(option: string): void {
    this.isTargetManuallySetOptions.forEach(target => {
      target.checked = !target.checked;
    });

    if (!option) this.targetValue = null;
    this.isTargetOptionManual = option === "true";

    this.logger.debug('[onTargetOptionChange]', {
      isTargetManuallySetOptions: this.isTargetManuallySetOptions,
      isTargetOptionManual: this.isTargetOptionManual,
      value: this.targetValue
    });
  }


  /**
   * Setup widget data
   */
  retrievePacketsAndFields() {
    this.hPacketsService
      .findAllHPacketByProjectIdAndType(this.widget.projectId, "INPUT,IO")
      .subscribe({
        next: (res) => {
          this.allPackets = res;
          const devices = this.allPackets.map((x) => x.device);
          const groupDevices = [];
          devices.forEach((x) => {
            if (!groupDevices.some((y) => y.id === x.id)) {
              groupDevices.push(x);
            }
          });

          this.groupedPacketOptions = groupDevices.map((x) => ({
            name: x.deviceName,
            options: res
              .filter((y) => y.device.id === x.id)
              .map((y) => ({
                value: y.id,
                label: y.name,
                icon: 'icon-hyt_packets',
              })),
            icon: 'icon-hyt_device',
          }));

          this.setManualTargetValue();

          const productionTargetSettings = this.widget.config?.productionTargetSettings;
          if (productionTargetSettings?.produced?.packet) {
            const totalFields = Object.keys(productionTargetSettings).length;
            let processedFields = 0;

            for (const [key, value] of Object.entries(productionTargetSettings)) {
              const packetId = key === 'target' ?
                (this.isTargetOptionManual ? null : value.dynamicallySetField.packet) :
                value.packet;

              if (packetId === undefined) {
                this.fieldAliases[key] = value.fieldAlias;
                processedFields++;
                continue;
              }

              if (packetId === null) {
                this.isTargetManuallySetOptions = value.isTargetManuallySetOptions;
                this.targetValue = value.manuallySetField.targetManuallySetValue;
                this.fieldAliases[key] = value.manuallySetField.fieldAlias;
                processedFields++;
                continue;
              }

              this.hPacketsService.findHPacket(packetId).subscribe({
                next: (packet: HPacket) => {
                  processedFields++;
                  this.processPacketAndConfiguration(packet, key, totalFields, processedFields);
                },
                error: (error) => {
                  this.logger.error('[retrievePacketsAndFields]', error);
                }
              });
            }
          } else {
            this.contentLoaded = true;
          }

        },
        error: (err) => {
          this.logger.error('[retrievePacketsAndFields] findAllHPacketByProjectIdAndType', err);
        }
      });
  }

  /**
   * Process configured widget's data
   * @param packet
   * @param key
   * @param totalFields
   * @param processedFields
   */
  processPacketAndConfiguration(packet: HPacket, key: string, totalFields: number, processedFields: number) {
    this.selectedPackets[key] = packet;
    this.selectedPacketsOption[key] = this.selectedPackets[key].id;
    this.selectedFields[key] = key === 'target' ? this.widget.config.productionTargetSettings[key].dynamicallySetField.field : this.widget.config.productionTargetSettings[key].field;
    this.fieldsOptions[key] = this.selectedPackets[key].fields;
    if (this.widget.config.productionTargetSettings[key].fieldAlias || key === 'target') {
      this.fieldAliases[key] = key === 'target' ? this.widget.config.productionTargetSettings[key].dynamicallySetField.fieldAlias : this.widget.config.productionTargetSettings[key].fieldAlias;
    }
    if (this.widget.config.packetFields) {
      packet.fields.sort((a, b) => a.name < b.name ? -1 : 1);
    }

    if (processedFields === totalFields) {
      this.contentLoaded = true;
    }
    this.logger.debug('[retrievePacketsAndFields] settings', {
      isTargetManuallySetOptions: this.isTargetManuallySetOptions,
      selectedPacketsOption: this.selectedPacketsOption,
      selectedPackets: this.selectedPackets,
      selectedFields: this.selectedFields,
      fieldsOptions: this.fieldsOptions
    })
  }

  /**
   * Set target option and (eventually) manual value
   */
  setManualTargetValue() {
    if (this.widget.config.productionTargetSettings) {
      this.isTargetOptionManual = this.widget.config.productionTargetSettings.target.isTargetManuallySet;
      if (this.widget.config.productionTargetSettings.target.isTargetManuallySet) {
        this.targetValue = this.widget.config.productionTargetSettings.target.manuallySetField.targetManuallySetValue;
      }
      this.onTargetOptionChange(this.isTargetOptionManual ? "true" : "false");
    }
  }

  onPacketChange(packetOption, field: string) {
    this.selectedPacketsOption[field] = packetOption.value;
    this.selectedPackets[field] = this.allPackets.find(p => p.id === this.selectedPacketsOption[field]);
    this.fieldsOptions[field] = this.selectedPackets[field].fields;
    this.logger.debug('[onPacketChange] selected packet', {
      selectedPacketsOption: this.selectedPacketsOption,
      selectedPackets: this.selectedPackets
    })
    if (this.selectedFields) {
      delete this.selectedFields[field];
    }
  }

  onPacketFieldChange($event, field) {
    if ($event.length > 0) {
      if (this.selectedFields) {
        this.selectedFields[field] = { fieldId: $event, fieldName: this.fieldsOptions[field].find(field => field.id === $event[0]).name };
      } else {
        this.selectedFields = { [field]: { fieldId: $event, fieldName: this.fieldsOptions[field].find(field => field.id === $event[0]).name } };
      }
    } else {
      delete this.selectedFields[field];
    }

    this.logger.debug('[onPacketFieldChange] selected field', {
      selectedFields: this.selectedFields
    })
  }

  apply() {
    const producedConfig = {
      packet: this.selectedPacketsOption['produced'],
      field: this.selectedFields['produced'],
      fieldAlias: this.fieldAliases['produced']
    };

    const remainingConfig = {
      fieldAlias: this.fieldAliases['remaining']
    };

    const targetConfig = !this.isTargetOptionManual ? {
      isTargetManuallySetOptions: this.isTargetManuallySetOptions,
      isTargetManuallySet: this.isTargetOptionManual,
      dynamicallySetField: {
        packet: this.selectedPacketsOption['target'],
        field: this.selectedFields['target'],
        fieldAlias: this.fieldAliases['target']
      }
    } : {
      isTargetManuallySetOptions: this.isTargetManuallySetOptions,
      isTargetManuallySet: this.isTargetOptionManual,
      manuallySetField: {
        targetManuallySetValue: this.targetValue,
        fieldAlias: this.fieldAliases['target']
      }
    };

    const currentShiftConfig = !this.selectedPacketsOption['current_shift'] ? {
      fieldAlias: this.fieldAliases['current_shift']
    } : {
      packet: this.selectedPacketsOption['current_shift'],
      field: this.selectedFields['current_shift'],
      fieldAlias: this.fieldAliases['current_shift']
    };

    const config = {
      produced: producedConfig,
      remaining: remainingConfig,
      target: targetConfig,
      current_shift: currentShiftConfig
    };

    if (!this.widget.config) {
      this.widget.config = { productionTargetSettings: config };
    } else {
      this.widget.config.productionTargetSettings = config;
    }

    this.logger.debug('[apply] saved config', config);
  }

  /**
   * Returns the field name
   * @param fieldId the field's id
   */
  returnFieldName(fieldId: string): string {
    switch (fieldId) {
      case "target":
        return $localize`:@@HYT_target:Target`;
      case "produced":
        return $localize`:@@HYT_produced:Produced`;
      case "current_shift":
        return $localize`:@@HYT_current_shift:Current Shift`;
      default:
        return;
    }
  }
}
