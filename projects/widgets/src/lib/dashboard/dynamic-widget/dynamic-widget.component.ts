import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import { PacketData } from 'core';
import {TypeModelService, ServiceType} from '../../service/model/service-type';

@Component({
  selector: 'hyperiot-dynamic-widget',
  templateUrl: './dynamic-widget.component.html',
  styleUrls: ['./dynamic-widget.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DynamicWidgetComponent implements OnInit {
  @Input()
  widget;
  @Input()
  serviceType: TypeModelService = ServiceType.OFFLINE;
  @Input()
  initData: PacketData[] = [];
  @Input()
  isToolbarVisible = true;
  @Output()
  widgetAction: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onWidgetAction(data) {
    this.widgetAction.emit(data);
  }

}
