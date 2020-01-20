import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Area } from '@hyperiot/core';

@Component({
  selector: 'hyt-areas-list',
  templateUrl: './areas-list.component.html',
  styleUrls: ['./areas-list.component.scss']
})
export class AreasListComponent {
  @Output() itemSelected = new EventEmitter<Area>();
  @Input() areaList;

  onAreaItemClick(area: Area) {
    this.itemSelected.emit(area);
  }
}
