import { Component, OnInit, HostListener, EventEmitter } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'hyt-draggable-item',
  templateUrl: './draggable-item.component.html',
  styleUrls: ['./draggable-item.component.scss']
})
export class DraggableItemComponent implements OnInit {
  removeClicked = new EventEmitter<any>();
  itemData: any = {
    position: { x: 0, y: 0}
  };
  container;
  position;
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
    console.log('onDragEnded', e, source.getFreeDragPosition());
    const position = source.getFreeDragPosition();
    this.itemData.position = {
      x: position.x / this.container.clientWidth,
      y: position.y / this.container.clientHeight
    }
    this.refresh();
  }
  onRemoveButtonClick(e) {
    console.log('onRemoveButtonClick', e);
    this.removeClicked.emit(null);
  }

  setConfig(container: HTMLElement, itemData: any) {
    this.container = container;
    this.itemData = itemData;
    this.style['background-image'] = `url(assets/icons/${itemData.icon})`;
    this.style['background-size'] = `64px 64px`;
    this.refresh();
  }
  setPosition(rp: {x: number, y: number}) {
    if (rp) {
      this.itemData.position = rp;
    }
    // normalize to view size
    this.position = {
      x: this.itemData.position.x * this.container.clientWidth,
      y: this.itemData.position.y * this.container.clientHeight
    };
  }
  refresh() {
    this.setPosition(this.itemData.position);
  }
}
