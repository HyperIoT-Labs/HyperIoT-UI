import { HytModal, HytModalService } from '@hyperiot/components';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hyt-widget-fullscreen-dialog',
  templateUrl: './widget-fullscreen-dialog.component.html',
  styleUrls: ['./widget-fullscreen-dialog.component.scss']
})
export class WidgetFullscreenDialogComponent extends HytModal implements OnInit {

  @Output() widgetAction: EventEmitter<any> = new EventEmitter();

  widget: any = null;
  widgetName: string = '';
  isConfigured: boolean = false;
  fullScreenData = '';

  constructor(
    hytModalService: HytModalService,
  ) {
    super(hytModalService);
  }

  ngOnInit(): void {
    console.log('FULLSCREEN DATA', this.data)
    console.log('FULLSCREEN MODAL REF', this.hytModalref)
    console.log('FULLSCREEN IS CONFIG', this.data?.widget?.instance?.isConfigured)
    this.widget = this.data?.widget;
    this.widgetName = this.data?.widget?.name;
    this.isConfigured = this.data?.widget?.instance?.isConfigured;
    this.fullScreenData = this.data.data;
  }

  closeModal(event?): void {
    console.log('closeModal', event)
    this.fullScreenData = ''
    this.close(event);
  }

  configureWidget() {
    this.close({
      action: 'widget:setting',
      widget: this.widget
    })
  }

}
