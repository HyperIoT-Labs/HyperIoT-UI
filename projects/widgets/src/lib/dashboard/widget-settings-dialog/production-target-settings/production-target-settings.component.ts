import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { SelectOptionGroup } from 'components';
import { HPacket, HPacketField, HpacketsService, Logger, LoggerService } from 'core';
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

  private logger: Logger;

  contentLoaded: boolean = false;

  isTargetManuallySetOptions = [
    { value: 'true', label: 'Set Manually', checked: true },
    { value: 'false', label: 'Set Dynamically', checked: false }
  ];
  isTargetOptionManual: boolean = true;
  targetValue: number = null;

  fieldAliases: FieldAliases;

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
    private hPacketsService: HpacketsService,
    private cd: ChangeDetectorRef
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

  updateTargetValue(inputValue: number) {
    this.targetValue = inputValue;
  }

  onTargetOptionChange(option: boolean): void {
    this.isTargetManuallySetOptions.forEach(target => {
      target.checked = option ? target.value === 'true' : target.value === 'false';
    });

    if (!option) {
      this.targetValue = null;
    }
    
    this.isTargetOptionManual = option;
    this.cd.detectChanges();
  
    console.log('[onTargetOptionChange]', {
      option: option,
      isTargetManuallySetOptions: this.isTargetManuallySetOptions,
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
          if (this.widget.config?.productionTargetSettings?.fields.produced.packet) {
            this.setFormValues();
            const totalFields = Object.keys(this.widget.config?.productionTargetSettings.fields).length;
            let processedFields = 0;
            Object.keys(this.widget.config?.productionTargetSettings.fields).forEach(key => {
              this.hPacketsService.findHPacket(this.widget.config?.productionTargetSettings.fields[key].packet).subscribe({
                next: (packet: HPacket) => {
                  processedFields++;
                  this.processPacketAndConfiguration(packet, key, totalFields, processedFields);
                },
                error: (error) => {
                  this.logger.error('[retrievePacketsAndFields]', error);
                }
              });
            });
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
    this.isTargetManuallySetOptions = this.widget.config.productionTargetSettings.isTargetManuallySetOptions;
    this.targetValue = null;
    this.selectedPackets[key] = packet;
    this.selectedPacketsOption[key] = this.selectedPackets[key].id;
    this.selectedFields[key] = this.widget.config.productionTargetSettings.fields[key].field;
    this.fieldsOptions[key] = this.selectedPackets[key].fields;
    if (this.widget.config.productionTargetSettings.fields[key].fieldAlias) {
      this.fieldAliases[key] = this.widget.config.productionTargetSettings.fields[key].fieldAlias;
    }
    if (this.widget.config.packetFields) {
      packet.fields.sort((a, b) => a.name < b.name ? -1 : 1);
    }

    if (processedFields === totalFields) {
      this.contentLoaded = true;
    }
    this.logger.debug('[retrievePacketsAndFields] settings', {
      isTargetManuallySetOptions: this.isTargetManuallySetOptions,
      targetManualValue: this.widget.config?.productionTargetSettings.targetManuallySetValue,
      selectedPacketsOption: this.selectedPacketsOption,
      selectedPackets: this.selectedPackets,
      selectedFields: this.selectedFields,
      fieldsOptions: this.fieldsOptions
    })
  }

  /**
   * Set target option and (eventually) manual value
   */
  setFormValues() {
    this.isTargetOptionManual = this.widget.config.productionTargetSettings.isTargetManuallySet;
    if (this.widget.config.productionTargetSettings.isTargetManuallySet) {
      this.targetValue = this.widget.config.productionTargetSettings.targetManuallySetValue;
    }
    this.onTargetOptionChange(this.isTargetOptionManual);
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
    const isCurrentShiftUndefined = this.selectedPacketsOption['current_shift'] === undefined;
    if ((this.isTargetOptionManual && this.targetValue !== null) || (!this.selectedPackets['produced'] || !this.selectedFields['produced'])) {
      return
    }
    const config: ProductionTargetSettings.ProductionTargetSettings = {
      isTargetManuallySetOptions: this.isTargetManuallySetOptions,
      isTargetManuallySet: this.isTargetOptionManual,
      fields: {
        produced: {
          packet: this.selectedPacketsOption['produced'],
          field: this.selectedFields['produced']
        }
      }
    };

    if (!this.isTargetOptionManual) {
      config.fields.target = {
        packet: this.selectedPacketsOption['target'],
        field: this.selectedFields['target']
      };
    } else {
      config.targetManuallySetValue = this.targetValue
    }

    if (!isCurrentShiftUndefined) {
      config.fields.current_shift = {
        packet: this.selectedPacketsOption['current_shift'],
        field: this.selectedFields['current_shift']
      };
    }

    if (Object.keys(this.fieldAliases).length > 0) {
      Object.keys(this.fieldAliases).forEach(fieldAlias => {
        config.fields[fieldAlias].fieldAlias = this.fieldAliases[fieldAlias];
      });
    }

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
