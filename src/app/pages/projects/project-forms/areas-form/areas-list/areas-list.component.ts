import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Area } from '@hyperiot/core';

@Component({
  selector: 'hyt-areas-list',
  templateUrl: './areas-list.component.html',
  styleUrls: ['./areas-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AreasListComponent {
  @Output() itemSelected = new EventEmitter<Area>();
  @Input() areaList;

  onAreaItemClick(area: Area) {
    this.itemSelected.emit(area);
  }
}
