import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectOption, SelectOptionGroup } from 'components';
import { HPacket, HPacketField, HPacketFieldsHandlerService, HpacketsService, Logger, LoggerService } from 'core';
import { WidgetConfig } from '../../../base/base-widget/model/widget.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'hyperiot-production-target-settings',
  templateUrl: './production-target-settings.component.html',
  styleUrls: ['./production-target-settings.component.scss']
})
export class ProductionTargetSettingsComponent implements OnInit {
  @Input() widget: WidgetConfig;
  @Input() areaId;
  @Input() modalApply: Observable<any>;

  private logger: Logger;

  subscription: any;
  allPackets: HPacket[] = [];
  groupedPacketOptions: SelectOptionGroup[] = [];

  /** The target value manually setted data */
  targetManualValue: string = "";

  selectedPackets: { [key: string]: HPacket };
  selectedPacketsOption: { [key: string]: number };

  fieldsOption: { [key: string]: SelectOption[] };

  selectedFieldsOptions: { [key: string]: number };

  settableParameters: string[] = ['target', 'produced', 'current_shift'];

  constructor(
    loggerService: LoggerService,
    private hPacketsService: HpacketsService,
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService,
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("ProductionTargetSettingsComponent");
  }

  ngOnInit(): void {
    this.retrievePacketsAndFields();
  }

  retrievePacketsAndFields() {
  this.subscription = this.modalApply.subscribe((event) => {
      if (event === 'apply') {
          this.apply();
      }
  });
    this.hPacketsService
      .findAllHPacketByProjectId(this.widget.projectId)
      .subscribe((res) => {
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
          Object.keys(this.widget.config?.productionTargetSettings.fields).forEach(key => {
            this.hPacketsService.findHPacket(this.widget.config?.productionTargetSettings.fields[key].packet).subscribe(
              (packet: HPacket) => {
                if (this.selectedPackets) {
                  this.selectedPackets[key] = packet;
                  this.selectedPacketsOption[key] = this.selectedPackets[key].id;
                } else {
                  this.selectedPackets = {[key]: packet};
                  this.selectedPacketsOption = {[key]: this.selectedPackets[key].id};
                }
                const fieldsFlatList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.selectedPackets[key]);
                if (this.fieldsOption) {
                  this.fieldsOption[key] = fieldsFlatList.map(x => ({
                    value: x.field.id,
                    label: x.label
                  }));
                } else {
                  this.fieldsOption = { [key]: fieldsFlatList.map(x => ({
                    value: x.field.id,
                    label: x.label
                  }))};
                }
                if (this.selectedFieldsOptions) {
                  this.selectedFieldsOptions[key] = this.widget.config.productionTargetSettings.fields[key].field;
                } else {
                  this.selectedFieldsOptions = { [key]: this.widget.config.productionTargetSettings.fields[key].packet }
                }
                if (this.widget.config.packetFields) {
                  
                  packet.fields.sort((a, b) => a.name < b.name ? -1 : 1);
                }
              }
            );
          });
        }
      });

  }

  onPacketChange(packetOption, field: string) {
    if (this.selectedPacketsOption) {
      this.selectedPacketsOption[field] = packetOption.value;
      this.selectedPackets[field] = this.allPackets.find(p => p.id === this.selectedPacketsOption[field]);
    } else {
      this.selectedPacketsOption = { [field]: packetOption.value };
      this.selectedPackets = { [field]: this.allPackets.find(p => p.id === this.selectedPacketsOption[field]) };
    }
    const fieldsFlatList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.selectedPackets[field]);
    if (this.fieldsOption && this.fieldsOption[field]) {
      delete this.fieldsOption[field];
      this.fieldsOption[field] = fieldsFlatList.map(x => ({
        value: x.field.id,
        label: x.label
      }));
    } else {
      this.fieldsOption = {
        [field]: fieldsFlatList.map(x => ({
          value: x.field.id,
          label: x.label
        }))
      };
    }

    if (this.selectedFieldsOptions) {
      delete this.selectedFieldsOptions[field];
    }
  }

  onPacketFieldChange($event, field) {
    if ($event.length > 0) {
      if (this.selectedFieldsOptions) {
        this.selectedFieldsOptions[field] = $event[0];
      } else {
        this.selectedFieldsOptions = { [field]: $event[0] };
      }
    } else {
      delete this.selectedFieldsOptions[field];
    }
  }

  apply() {
    const config = {
      isTargetManuallySet: this.targetManualValue !== '' ? true : false,
      fields: {
        produced: {
          packet: this.selectedPackets.produced.id,
          field: this.selectedFieldsOptions.produced
        },
        current_shift: {
          packet: this.selectedPackets.current_shift.id,
          field: this.selectedFieldsOptions.current_shift
        }
      }
    };

    if (!this.widget.config) {
      this.widget.config = { productionTargetSettings: config };
    } else {
      this.widget.config.productionTargetSettings = config;
    }

    if (this.targetManualValue === '') {
      this.widget.config.productionTargetSettings.fields.target = 
      {
        packet: this.selectedPackets.target.id,
        field: this.selectedFieldsOptions.target
      }
    } else {
      this.widget.config.productionTargetSettings.targetManuallySetValue = this.targetManualValue;
    }
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
