import { DIALOG_DATA, DialogRef } from 'components';
import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { ServiceType } from '../../service/model/service-type';
import { PacketData } from 'core';

@Component({
  selector: 'hyt-widget-fullscreen-dialog',
  templateUrl: './widget-fullscreen-dialog.component.html',
  styleUrls: ['./widget-fullscreen-dialog.component.scss']
})
export class WidgetFullscreenDialogComponent implements OnInit {

  @Output() widgetAction: EventEmitter<any> = new EventEmitter();

  widget: any = null;
  widgetName = '';
  fullScreenInitData: PacketData[] = [];
  serviceType: ServiceType;

  constructor(
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.widget = this.data?.widget;
    this.widgetName = this.data?.widget?.name;
    this.fullScreenInitData = this.data.initData;
    this.serviceType = this.data.serviceType;
  }

  closeModal(event?): void {
    this.fullScreenInitData = [];
    this.dialogRef.close(event);
  }

  configureWidget() {
    this.dialogRef.close({
      action: 'widget:setting',
      widget: this.widget
    })
  }

}
