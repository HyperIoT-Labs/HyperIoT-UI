import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hyt-hexagon',
  templateUrl: './hyt-hexagon.component.html',
  styleUrls: ['./hyt-hexagon.component.css']
})
export class HytHexagonComponent {

  @Input()
  iconPath: string;

  @Input()
  dimension = 1;

  @Output()
  clicked: EventEmitter<{event: any, icon: string}> = new EventEmitter<{event: any, icon: string}>();

  constructor() { }
  hexClicked(event) {
    this.clicked.emit({event, icon: this.iconPath});
  }

}
