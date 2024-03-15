import { Component } from "@angular/core";
import { BaseWidgetComponent } from "../../base/base-widget/base-widget.component";
import { HPacketField, WsDataSenderService } from "core";
import { Subscription } from "rxjs";
import { DataSimulatorSettings } from "../../dashboard/widget-settings-dialog/data-simulator-settings/data-simulator.models";

enum SimulatorStatus {
  PENDING = 0,
  UNAUTHORIZED = -1,
  ERROR = -2,
  CONNECTED = 1,
  CONNECTION_CLOSED = 2,
}

@Component({
  selector: "hyperiot-data-simulator",
  templateUrl: "./data-simulator.component.html",
  styleUrls: [
    "../../../../../../src/assets/widgets/styles/widget-commons.css",
    "./data-simulator.component.scss",
  ],
})
export class DataSimulatorComponent extends BaseWidgetComponent {
  wsSenderService: WsDataSenderService = new WsDataSenderService();
  wsSubscription: Subscription;
  status: SimulatorStatus = SimulatorStatus.PENDING;

  isActive = false;

  packetInfo: string;
  isOutlierColumnVisible = false;

  fieldList: { [fieldId: number]: string };
  fieldRules: DataSimulatorSettings.FieldRules;
  fieldType: DataSimulatorSettings.FieldType;
  fieldOutliers: DataSimulatorSettings.FieldOutliers;

  ngOnInit(): void {
    super.ngOnInit();

    this.configure();
  }

  configure() {
    if (!this.widget.config) {
      this.isConfigured = false;
      return;
    }
    this.isConfigured = true;

    this.isActive = false;
    this.resetGenerationProperties();

    this.packetInfo =
      this.widget.config.dataSimulatorSettings.deviceInfo.name +
      " - " +
      this.widget.config.dataSimulatorSettings.packetInfo.packetName;

    this.fieldList = this.widget.config.packetFields;
    this.fieldRules = this.widget.config.dataSimulatorSettings.fieldRules;
    this.fieldType = this.widget.config.dataSimulatorSettings.fieldType;
    this.fieldOutliers = this.widget.config.dataSimulatorSettings.fieldOutliers;

    // setting isOutlierColumnVisible
    this.isOutlierColumnVisible = Object.keys(this.fieldOutliers).length > 0;

    this.connect();
  }

  connect() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
      this.status = SimulatorStatus.PENDING;
    }
    this.wsSubscription = this.wsSenderService
      .connect(
        this.widget.config.dataSimulatorSettings.deviceInfo.name,
        this.widget.config.dataSimulatorSettings.deviceInfo.password,
        this.widget.config.dataSimulatorSettings.topic
      )
      .subscribe({
        next: (value) => {
          if (this.status === SimulatorStatus.CONNECTED) {
            return;
          }
          if (value === DataSimulatorSettings.Utils.WS_CONNECTED) {
            this.status = SimulatorStatus.CONNECTED;
            this.generateAndSendData();
          } else if (value === DataSimulatorSettings.Utils.WS_UNAUTHORIZED) {
            this.status = SimulatorStatus.UNAUTHORIZED;
          } else {
            this.status = SimulatorStatus.ERROR;
          }
        },
        error: (error) => (this.status = SimulatorStatus.ERROR),
        complete: () => (this.status = SimulatorStatus.CONNECTION_CLOSED),
      });
  }

  // generate and send data
  counter = 0;
  lastPacket: { [fieldId: number]: any } = {};
  generationError: { [fieldId: number]: string } = {};
  interval;
  generateAndSendData() {
    this.resetGenerationProperties();

    this.interval = setInterval(() => {
      if (!this.isActive) {
        return;
      }

      const timestamp = new Date().getTime();
      const packet = { timestamp };
      this.generationError = {};

      Object.keys(this.fieldRules).forEach((fieldId) => {
        const fieldRule = this.fieldRules[+fieldId];

        let fieldValue;
        try {
          switch (fieldRule.type) {
            case "fixed":
              fieldValue = fieldRule.value;
              break;
            case "range":
              const minVal = Math.min(fieldRule.min, fieldRule.max);
              const maxVal = Math.max(fieldRule.min, fieldRule.max);
              fieldValue = Math.random() * (maxVal - minVal) + minVal;
              debugger;
              if (this.fieldType[+fieldId] == HPacketField.TypeEnum.INTEGER)
                fieldValue = Math.round(fieldValue);

              break;
            case "dataset":
              const values = JSON.parse(fieldRule.values); // todo Move this conversion in the configuration to avoid having to perform it each time
              fieldValue = values[this.counter % values.length];
              break;
            // TODO shouldn't use eval. The evaluation should be performed using a specific library.
            case "expression":
              let convertedExpression = fieldRule.expression;
              // TODO should use replaceAll!
              for (let operator of DataSimulatorSettings.Utils
                .expressionOperators) {
                convertedExpression = convertedExpression.replace(
                  operator.regex,
                  operator.function
                );
              }
              convertedExpression = convertedExpression.replace(
                /#x/gi,
                String(timestamp)
              );
              convertedExpression = convertedExpression.replace(
                /#i/gi,
                String(this.counter)
              );
              convertedExpression = convertedExpression.replace(
                /#r/gi,
                String(this.lastPacket[this.fieldList[fieldId]] || 0)
              );
              fieldValue = eval(convertedExpression);
              break;
            default:
              break;
          }
          packet[this.fieldList[fieldId]] = fieldValue;
        } catch (error) {
          this.generationError[fieldId] = true;
        }
      });

      this.lastPacket = packet;

      // generate nested object from flat object before sending it
      const nestedObject = {};
      for (let fieldName in packet) {
        const fieldHierarchy = fieldName.split(".");
        let currentField = nestedObject;
        for (let i = 0; i < fieldHierarchy.length - 1; i++) {
          if (!currentField[fieldHierarchy[i]]) {
            currentField[fieldHierarchy[i]] = {};
          }
          currentField = currentField[fieldHierarchy[i]];
        }
        currentField[fieldHierarchy[fieldHierarchy.length - 1]] =
          packet[fieldName];
      }
      this.wsSenderService.send(nestedObject);

      this.counter++;
    }, this.widget.config.dataSimulatorSettings.period);
  }

  resetGenerationProperties() {
    this.counter = 0;
    this.lastPacket = {};
    this.generationError = {};
    clearInterval(this.interval);
  }

  generateOutlier(field) {
    if (this.status !== SimulatorStatus.CONNECTED) {
      return;
    }
    const packet = {
      timestamp: new Date().getTime(),
      [field.value]: this.fieldOutliers[field.key],
    };
    this.wsSenderService.send(packet);
  }

  toggleActive() {
    this.isActive = !this.isActive;
  }

  onToolbarAction(action: string) {
    switch (action) {
      case "toolbar:settings":
        this.isActive = false;
        break;
    }
    this.widgetAction.emit({ widget: this.widget, action });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.wsSenderService.disconnect();
    clearInterval(this.interval);
  }
}
