import { HytModal, HytModalService } from 'components';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ServiceType } from '../../service/model/service-type';
import { PacketData } from 'core';

@Component({
  selector: 'hyt-widget-fullscreen-dialog',
  templateUrl: './widget-fullscreen-dialog.component.html',
  styleUrls: ['./widget-fullscreen-dialog.component.scss']
})
export class WidgetFullscreenDialogComponent extends HytModal implements OnInit {

  @Output() widgetAction: EventEmitter<any> = new EventEmitter();

  widget: any = null;
  widgetName = '';
  fullScreenInitData: PacketData[] = [];
  serviceType: ServiceType;

  constructor(
    hytModalService: HytModalService,
  ) {
    super(hytModalService);
  }

  ngOnInit(): void {
    this.widget = this.data?.widget;
    this.widgetName = this.data?.widget?.name;
    this.fullScreenInitData = this.data.initData;
    this.serviceType = this.data.serviceType;
  }

  closeModal(event?): void {
    this.fullScreenInitData = [];
    this.close(event);
  }

  configureWidget() {
    this.close({
      action: 'widget:setting',
      widget: this.widget
    })
  }

}
