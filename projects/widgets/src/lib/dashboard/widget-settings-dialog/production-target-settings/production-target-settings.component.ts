import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectOption, SelectOptionGroup } from 'components';
import { HPacket, HPacketFieldsHandlerService, HpacketsService, Logger, LoggerService } from 'core';
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

  options = [
    { value: 'string', label: 'Set Manually', checked: true },
    { value: 'packet', label: 'Set Dynamically', checked: false }
  ];

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
    this.initForm();
    this.retrievePacketsAndFields();
  }

  initForm() {
    this.form = this.fb.group({
      targetOption: ['string', Validators.required],
      targetManualValue: [''],
      target: this.fb.group({
        packet: [''],
        field: ['']
      }),
      produced: this.fb.group({
        packet: ['', Validators.required],
        field: ['', Validators.required]
      }),
      current_shift: this.fb.group({
        packet: [''],
        field: ['']
      })
    });
    this.onTargetOptionChange('string');
  }

  onTargetOptionChange(option: string): void {
    if (option === 'string') {
      this.form.get('targetManualValue').enable();
      this.form.get('target').disable();
    } else {
      this.form.get('targetManualValue').disable();
      this.form.get('target').enable();
    }
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
                  this.selectedPackets = { [key]: packet };
                  this.selectedPacketsOption = { [key]: this.selectedPackets[key].id };
                }
                const fieldsFlatList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.selectedPackets[key]);
                if (this.fieldsOption) {
                  this.fieldsOption[key] = fieldsFlatList.map(x => ({
                    value: x.field.id,
                    label: x.label
                  }));
                } else {
                  this.fieldsOption = {
                    [key]: fieldsFlatList.map(x => ({
                      value: x.field.id,
                      label: x.label
                    }))
                  };
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
    debugger
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
    if ((this.form.get('targetOption').value === 'string' && this.form.get('targetManualValue').value === '') || (this.form.get('targetOption').value !== 'string' && this.form.get('target').get('packet').value === '')) {
      return console.error('Please set the target value');
    }
    const config = {
      isTargetManuallySet: this.form.get('targetOption').value === 'string' ? true : false,
      fields: {
        produced: {
          packet: this.form.get('produced').get('packet').value,
          field: this.form.get('produced').get('field').value
        },
        current_shift: {
          packet: this.form.get('current_shift').get('packet').value,
          field: this.form.get('current_shift').get('field').value
        }
      }
    };

    if (!this.widget.config) {
      this.widget.config = { productionTargetSettings: config };
    } else {
      this.widget.config.productionTargetSettings = config;
    }

    if (!config.isTargetManuallySet && this.form.get('targetManualValue').value === '') {
      this.widget.config.productionTargetSettings.fields.target =
      {
        packet: this.form.get('target').get('packet').value,
        field: this.form.get('target').get('field').value
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
