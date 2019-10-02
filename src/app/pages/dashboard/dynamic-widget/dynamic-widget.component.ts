import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'hyt-dynamic-widget',
  templateUrl: './dynamic-widget.component.html',
  styleUrls: ['./dynamic-widget.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DynamicWidgetComponent implements OnInit {
  @Input()
  widget;
  @Output()
  widgetAction: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onWidgetAction(data) {
    this.widgetAction.emit(data);
  }

}
