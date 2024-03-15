import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectOption, SelectOptionGroup } from 'components';
import { HPacket, HPacketField, HPacketFieldsHandlerService, HpacketsService, Logger, LoggerService } from 'core';
import { Observable } from 'rxjs';
import { WidgetConfig } from '../../../base/base-widget/model/widget.model';
import { ProductionTargetSettings } from './production-target.model';

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

  contentLoaded: boolean = false;

  isTargetManuallySetOptions = [
    { value: 'true', label: 'Set Manually', checked: true },
    { value: 'false', label: 'Set Dynamically', checked: true }
  ];

  subscription: any;
  allPackets: HPacket[] = [];
  groupedPacketOptions: SelectOptionGroup[] = [];

  selectedPackets: { [key: string]: HPacket } = {};
  selectedPacketsOption: { [key: string]: number } = {};
  selectedFields: { [key: string]: number } = {};
  fieldsOptions: { [key: string]: HPacketField[] } = {};
  settableParameters: string[] = ['target', 'produced', 'current_shift'];

  form: FormGroup;

  constructor(
    loggerService: LoggerService,
    private hPacketsService: HpacketsService,
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService,
    private fb: FormBuilder
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
    this.initForm();
    this.retrievePacketsAndFields();
  }

  initForm() {
    this.form = this.fb.group({
      isTargetOptionManual: ['true', Validators.required],
      targetManualValue: ['']
    });
    this.onTargetOptionChange('true');
  }

  onTargetOptionChange(option: string): void {
    if (option === 'true') {
      this.form.get('targetManualValue').setValue(this.form.get('targetManualValue').value !== '' ? this.form.get('targetManualValue').value : '');
      this.form.get('targetManualValue').enable();
      this.isTargetManuallySetOptions.forEach(target => {
        if (target.value === 'true') {
          target.checked = true;
        } else {
          target.checked = false;
        }
      })
    } else {
      this.form.get('targetManualValue').disable();
      this.isTargetManuallySetOptions.forEach(target => {
        if (target.value === 'false') {
          target.checked = true;
        } else {
          target.checked = false;
        }
      })
    }

    this.form.get('isTargetOptionManual').patchValue(option);
    console.log('options', {
      option: option,
      value: this.form.get('targetManualValue').value,
      disabled: this.form.get('targetManualValue').disabled
    })
  }

  retrievePacketsAndFields() {
    this.hPacketsService
      .findAllHPacketByProjectIdAndType(this.widget.projectId, "INPUT,IO")
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
          this.setFormValues();
          const totalFields = Object.keys(this.widget.config?.productionTargetSettings.fields).length;
          let processedFields = 0;
          Object.keys(this.widget.config?.productionTargetSettings.fields).forEach(key => {
            this.hPacketsService.findHPacket(this.widget.config?.productionTargetSettings.fields[key].packet).subscribe(
              (packet: HPacket) => {
                this.isTargetManuallySetOptions = this.widget.config.productionTargetSettings.isTargetManuallySetOptions;
                this.selectedPackets[key] = packet;
                this.selectedPacketsOption[key] = this.selectedPackets[key].id;
                this.selectedFields[key] = this.widget.config.productionTargetSettings.fields[key].field;
                this.fieldsOptions[key] = this.selectedPackets[key].fields;
                if (this.widget.config.packetFields) {
                  packet.fields.sort((a, b) => a.name < b.name ? -1 : 1);
                }

                processedFields++;
                console.log('contentLoader load', this.contentLoaded)
                if (processedFields === totalFields) {
                  this.contentLoaded = true;
                }
                console.log('production load', {
                  selectedPacketsOption: this.selectedPacketsOption,
                  selectedPackets: this.selectedPackets,
                  selectedFields: this.selectedFields,
                  fieldsOptions: this.fieldsOptions
                })
              }
            );
          });
        } else {
          this.contentLoaded = true;
        }
      });

  }

  setFormValues() {
    this.form.get('isTargetOptionManual').setValue(this.widget.config.productionTargetSettings.isTargetManuallySet);
    if (this.widget.config.productionTargetSettings.isTargetManuallySet) {
      this.form.get('targetManualValue').setValue(this.widget.config.productionTargetSettings.targetManuallySetValue);
    }
    this.onTargetOptionChange(this.form.get('isTargetOptionManual').value);
    console.log('production target settings', this.form.value)
  }

  onPacketChange(packetOption, field: string) {
    this.selectedPacketsOption[field] = packetOption.value;
    this.selectedPackets[field] = this.allPackets.find(p => p.id === this.selectedPacketsOption[field]);
    this.fieldsOptions[field] = this.selectedPackets[field].fields;
    // in the config I save the options but I need to save the full fields
    console.log('production packet', {
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
        this.selectedFields[field] = $event[0];
      } else {
        this.selectedFields = { [field]: $event[0] };
      }
    } else {
      delete this.selectedFields[field];
    }

    console.log('production field', {
      selectedFields: this.selectedFields
    })
  }

  apply() {
    if (this.form.get('isTargetOptionManual').value == 'true' && this.form.get('targetManualValue').value === '') {
      return console.error('Please set the target value');
    }

    if (this.form.get('isTargetOptionManual').value == 'false') {
      const config: ProductionTargetSettings.ProductionTargetSettings = {
        isTargetManuallySetOptions: this.isTargetManuallySetOptions,
        isTargetManuallySet: this.form.get('isTargetOptionManual').value,
        fields: {
          produced: {
            packet: this.selectedPacketsOption['produced'],
            field: this.selectedFields['produced']
          },
          current_shift: {
            packet: this.selectedPacketsOption['current_shift'],
            field: this.selectedFields['current_shift']
          },
          target: {
            packet: this.selectedPacketsOption['target'],
            field: this.selectedFields['target']
          }
        }
      };
      if (!this.widget.config) {
        this.widget.config = { productionTargetSettings: config };
      } else {
        this.widget.config.productionTargetSettings = config;
      }
    } else {
      const config: ProductionTargetSettings.ProductionTargetSettings = {
        isTargetManuallySetOptions: this.isTargetManuallySetOptions,
        isTargetManuallySet: this.form.get('isTargetOptionManual').value,
        targetManuallySetValue: this.form.get('targetManualValue').value,
        fields: {
          produced: {
            packet: this.selectedPacketsOption['produced'],
            field: this.selectedFields['produced']
          },
          current_shift: {
            packet: this.selectedPacketsOption['current_shift'],
            field: this.selectedFields['current_shift']
          }
        }
      };
      if (!this.widget.config) {
        this.widget.config = { productionTargetSettings: config };
      } else {
        this.widget.config.productionTargetSettings = config;
      }
    }

    console.log('production apply', {
      selectedPacketsOption: this.selectedPacketsOption,
      selectedPackets: this.selectedPackets,
      selectedFields: this.selectedFields
    })
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
