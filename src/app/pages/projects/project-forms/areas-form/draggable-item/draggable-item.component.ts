import { Component, OnInit, HostListener, EventEmitter } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { AreaDevice } from '@hyperiot/core';

@Component({
  selector: 'hyt-draggable-item',
  templateUrl: './draggable-item.component.html',
  styleUrls: ['./draggable-item.component.scss']
})
export class DraggableItemComponent implements OnInit {
  removeClicked = new EventEmitter<any>();
  positionChanged = new EventEmitter<any>();
  itemData = {} as AreaDevice;
  container;
  position = { x: 0, y: 0 };
  style: any = {};

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.refresh();
  }

  constructor() { }

  ngOnInit() {
  }

  onDragReleased(e) {
    //const source: CdkDrag = e.source;
    //console.log('onDragReleased', e, source.getFreeDragPosition(), this.dragPosition);
  }
  onDragMoved(e) {
    //console.log('onDragMoved', e);
  }
  onDragEnded(e) {
    const source: CdkDrag = e.source;
    const position = source.getFreeDragPosition();
    this.itemData.mapInfo.x = position.x / this.container.clientWidth;
    this.itemData.mapInfo.y = position.y / this.container.clientHeight;
    this.positionChanged.emit();
  }
  onRemoveButtonClick(e) {
    this.removeClicked.emit();
  }

  setConfig(container: HTMLElement, itemData: AreaDevice) {
    this.container = container;
    this.itemData = itemData;
    this.style['background-image'] = `url(assets/icons/${itemData.mapInfo.icon})`;
    this.style['background-size'] = `64px 64px`;
    this.refresh();
  }
  setPosition(x: number, y: number) {
    // normalize to view size
    this.itemData.mapInfo.x = x;
    this.itemData.mapInfo.y = y;
    this.refresh();
  }
  refresh() {
    this.position = {
      x: this.itemData.mapInfo.x * this.container.clientWidth,
      y: this.itemData.mapInfo.y * this.container.clientHeight
    };
  }
}
