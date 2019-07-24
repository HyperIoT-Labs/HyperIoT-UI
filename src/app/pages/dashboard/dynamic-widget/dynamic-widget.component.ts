import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'hyt-dynamic-widget',
  templateUrl: './dynamic-widget.component.html',
  styleUrls: ['./dynamic-widget.component.scss']
})
export class DynamicWidgetComponent implements OnInit {

  @Input()
  widget;

  constructor() { }

  ngOnInit() {
  }

}
