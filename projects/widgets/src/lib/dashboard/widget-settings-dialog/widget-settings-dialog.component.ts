import {Component, Inject, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';
import { DIALOG_DATA, DialogRef } from 'components';
import {Subject} from 'rxjs';
import { AutoUpdateConfigStatus, ConfigModel } from '../../base/base-widget/model/widget.model';

@Component({
  selector: 'hyperiot-widget-settings-dialog',
  templateUrl: './widget-settings-dialog.component.html',
  styleUrls: ['./widget-settings-dialog.component.scss']
})
export class WidgetSettingsDialogComponent implements OnInit {

  modalApply: Subject<any> = new Subject();
  // TODO quale e' il modello di widget?
  widget;
  widgetName;
  widgetId: string;
  areaId: string;
  @ViewChild('settingsForm', { static: false }) settingsForm: NgForm;

  dialogDataState = 0;

  autoUpdateConfigStatus: AutoUpdateConfigStatus = AutoUpdateConfigStatus.UNNECESSARY;

  constructor(
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.widget = this.data.widget;
    this.widgetName = this.data.widget.name;
    this.widgetId = this.data.currentWidgetIdSetting;
    this.dialogDataState = 1;
    this.areaId = this.data.areaId;

    this.autoUpdateConfig();
  }

  // close modal
  closeModal(event?): void {
    this.dialogRef.close(event);
  }

  getWidgetId() {
    return this.widgetId;
  }

  setWidget(w: any) {
    this.widget = w;
    this.widgetName = w.name;
  }

  confirm() {
    // common config options
    this.widget.name = this.widgetName;
    // signal 'apply' to widget specific config component
    this.modalApply.next('apply');
    // reconfigure widget instance with new values
    this.widget.instance.configure();
    // close dialog
    this.dialogRef.close('save');
  }

  private autoUpdateConfig() {
    try {
      const widgetConfig = this.widget.config as ConfigModel;
      if (widgetConfig && widgetConfig.packetUnitsConversion && widgetConfig.packetUnitsConversion.length > 0) {
        widgetConfig.fieldUnitConversions =  { };
        widgetConfig.packetUnitsConversion.forEach(element => {
          widgetConfig.fieldUnitConversions[element.field.id] = {
            convertFrom: element.convertFrom,
            convertTo: element.convertTo,
            decimals: element.decimals,
            options: element.options,
            conversionCustomLabel: element.conversionCustomLabel,
          }
        });
        delete widgetConfig.packetUnitsConversion;
        this.autoUpdateConfigStatus = AutoUpdateConfigStatus.SUCCESS;
      } else {
        this.autoUpdateConfigStatus = AutoUpdateConfigStatus.UNNECESSARY;
      }
    } catch(error) {
      this.autoUpdateConfigStatus = AutoUpdateConfigStatus.ERROR;
    }
  }

}
