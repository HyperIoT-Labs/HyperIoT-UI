import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import {
  AreaDevice,
  Area_Service,
  HDevice,
  HPacket,
  HPacketField,
  HPacketFieldsHandlerService,
  HPacketService,
} from "core";
import { WidgetConfig } from "../../../base/base-widget/model/widget.model";
import { SelectOption, SelectOptionGroup } from "components";
import { Observable } from "rxjs";
import { DataSimulatorSettings } from "./data-simulator.models";
import { ControlContainer, NgForm } from "@angular/forms";

@Component({
  selector: "hyperiot-data-simulator-settings",
  templateUrl: "./data-simulator-settings.component.html",
  styleUrls: ["./data-simulator-settings.component.scss"],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class DataSimulatorSettingsComponent implements OnInit {
  @Input() widget: WidgetConfig;

  @Input() areaId: number;

  @Input() modalApply: Observable<any>;

  @Input() settingsForm: NgForm;

  @Input() hDeviceId;

  projectPackets: HPacket[] = [];
  groupedPacketOptions: SelectOptionGroup[] = [];

  selectedPacket: HPacket;
  selectedPacketOption: number;

  fieldsOption: SelectOption[] = [];

  selectedFields: HPacketField[] = [];
  selectedFieldsOptions: number[] = [];
  selectedFieldsValidation = true;

  sourcePassword: string;

  period: number;

  fieldRules: DataSimulatorSettings.FieldRules = {};

  fieldType: DataSimulatorSettings.FieldType = {};

  fieldOutliers: DataSimulatorSettings.FieldOutliers = {};

  constructor(
    private areaService: Area_Service,
    private packetService: HPacketService,
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService
  ) {}

  ngOnInit(): void {
    if (this.widget.config == null) {
      this.widget.config = {};
    }

    // If `areaId` is set, then show only packets belonging to the given area devices
    if (this.areaId) {
      this.areaService
        .getAreaDeviceList(this.areaId)
        .subscribe((areaDevices: AreaDevice[]) => {
          const devices = areaDevices.map((ad: AreaDevice) => ad.device);
          this.loadPackets(devices);
        });
    } else {
      this.loadPackets();
    }

    if (this.widget.config.dataSimulatorSettings) {
      this.sourcePassword =
        this.widget.config.dataSimulatorSettings.deviceInfo.password;
      this.period = this.widget.config.dataSimulatorSettings.period;
      this.fieldRules = this.widget.config.dataSimulatorSettings.fieldRules;
      this.fieldType = this.widget.config.dataSimulatorSettings.fieldType;
      this.fieldOutliers =
        this.widget.config.dataSimulatorSettings.fieldOutliers;
    }

    this.modalApply.subscribe((event) => {
      if (event === "apply") {
        this.apply();
      }
    });
  }

  onPacketChange(packetOption) {
    this.selectedPacketOption = packetOption.value;
    this.selectedPacket = this.projectPackets.find(
      (p) => p.id === this.selectedPacketOption
    );
    this.fieldsOption = [];
    const fieldsFlatList =
      this.hPacketFieldsHandlerService.flatPacketFieldsTree(
        this.selectedPacket
      );
    this.fieldsOption = fieldsFlatList.map((x) => ({
      value: x.field.id,
      label: x.label,
    }));
    this.selectedFields = [];
    this.selectedFieldsOptions = [];
    this.selectedFieldsValidation = null;
  }

  onPacketFieldChange($event) {
    this.selectedFields = [];
    const nullIndex = this.selectedFields.indexOf(null);
    if (nullIndex >= 0) {
      delete this.selectedFields[nullIndex];
    }
    let selected = $event as any[];
    selected.map((s) => {
      this.selectedFields.push(
        this.hPacketFieldsHandlerService.findFieldFromPacketFieldsTree(
          this.selectedPacket,
          s
        )
      );
    });

    // reset fieldRules
    const tempFieldRules = { ...this.fieldRules };
    this.fieldRules = {};
    this.selectedFields.forEach((field) => {
      if (tempFieldRules[field.id]) {
        this.fieldRules[field.id] = { ...tempFieldRules[field.id] };
      } else {
        this.fieldRules[field.id] = { type: null };
      }
    });

    //reset fieldType
    this.fieldType = {};
    this.selectedFields.forEach((field) => {
      this.fieldType[field.id] = field.type;
    });

    // reset fieldOutliers
    const tempFieldOutliers = { ...this.fieldOutliers };
    this.fieldOutliers = {};
    this.selectedFields.forEach((field) => {
      if (tempFieldOutliers[field.id]) {
        this.fieldOutliers[field.id] = tempFieldOutliers[field.id];
      } else {
        this.fieldOutliers[field.id] = null;
      }
    });

    this.selectedFieldsValidation =
      this.selectedFields.length > 0 ? true : null;
  }

  loadPackets(devices?: HDevice[]) {
    this.packetService
      .findAllHPacketByProjectIdAndType(this.widget.projectId, "INPUT,IO")
      .subscribe((packetList) => {
        // Filter out packets not belonging to the given `devices` list (if set)
        if (devices) {
          packetList = packetList.filter((p: HPacket) => {
            if (p.device && devices.find((d) => d.id === p.device.id)) {
              return p;
            }
          });
        }
        this.projectPackets = packetList;
        this.projectPackets.sort((a, b) => (a.name < b.name ? -1 : 1));

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
              icon: "icon-hyt_packets",
            })),
          icon: "icon-hyt_device",
        }));

        // load current packet data and set selected fields
        if (this.widget.config?.dataSimulatorSettings?.packetInfo?.packetId) {
          this.packetService
            .findHPacket(
              this.widget.config.dataSimulatorSettings.packetInfo.packetId
            )
            .subscribe((packet: HPacket) => {
              this.selectedPacket = packet;
              this.selectedPacketOption = this.selectedPacket.id;
              const fieldsFlatList =
                this.hPacketFieldsHandlerService.flatPacketFieldsTree(
                  this.selectedPacket
                );
              this.fieldsOption = fieldsFlatList.map((x) => ({
                value: x.field.id,
                label: x.label,
              }));
              if (this.widget.config.packetFields) {
                this.selectedFields = [];
                Object.keys(this.widget.config.packetFields).forEach((x) => {
                  this.selectedFieldsOptions.push(+x);
                  this.selectedFields.push(
                    this.hPacketFieldsHandlerService.findFieldFromPacketFieldsTree(
                      packet,
                      +x
                    )
                  );
                });
                packet.fields.sort((a, b) => (a.name < b.name ? -1 : 1));
              }
            });
        }
      });
  }

  apply() {
    this.selectedPacket = this.projectPackets.find(
      (p) => p.id === +this.selectedPacketOption
    );

    this.widget.config.packetId = this.selectedPacket.id;
    (this.widget.config.packetFields as any) = {};
    this.selectedFields.map(
      (pf) =>
        (this.widget.config.packetFields[pf.id] =
          this.hPacketFieldsHandlerService.getStringifiedSequenceFromPacket(
            this.selectedPacket,
            pf.id
          ))
    );

    // remove null values from field outliers
    Object.keys(this.fieldOutliers).forEach((key) => {
      if (!this.fieldOutliers[key]) {
        delete this.fieldOutliers[key];
      }
    });

    this.widget.config.dataSimulatorSettings = {
      deviceInfo: {
        password: this.sourcePassword,
        name: this.selectedPacket.device.deviceName,
        id: this.selectedPacket.device.id,
      },
      packetInfo: {
        packetId: this.selectedPacket.id,
        packetName: this.selectedPacket.name,
      },
      topic:
        "streaming/" +
        this.selectedPacket.device.project.id +
        "/" +
        this.selectedPacket.device.id +
        "/" +
        this.selectedPacket.id,
      fieldRules: this.fieldRules,
      fieldOutliers: this.fieldOutliers,
      fieldType: this.fieldType,
      period: this.period,
    };
  }

  getFullFieldName(hPacketFieldId) {
    return this.hPacketFieldsHandlerService.getStringifiedSequenceFromPacket(
      this.selectedPacket,
      hPacketFieldId
    );
  }
}
