import {Component, EventEmitter, HostListener, ViewEncapsulation} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {AreaDevice} from 'core';

export enum DeviceActions {
  ALARMMANAGER,
  DASHBOARD
}

@Component({
  selector: 'hyt-draggable-item',
  templateUrl: './draggable-item.component.html',
  styleUrls: ['./draggable-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DraggableItemComponent {
  openClicked = new EventEmitter<any>();
  removeClicked = new EventEmitter<any>();
  positionChanged = new EventEmitter<any>();
  renderDataRequest = new EventEmitter<any>();

  deviceActions = DeviceActions;

  editMode = false;
  itemData = {} as any;
  container;
  position = { x: 0, y: 0 };
  style: any = {};
  renderData = {} as any;
  showName = false;

  titleToDisplay = '';

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.refresh();
  }

  onDragReleased(e) {
    //const source: CdkDrag = e.source;
    //console.log('onDragReleased', e, source);
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

  onOpenButtonClick(e: any, deviceActionType?: DeviceActions) {
    this.openClicked.emit(deviceActionType);
  }
  onRemoveButtonClick(e) {
    this.removeClicked.emit();
  }

  setConfig(container: HTMLElement, itemData: AreaDevice) {
    this.container = container;
    this.itemData = itemData;
    this.style['background-image'] = `url(assets/icons/${itemData.mapInfo.icon})`;
    this.style['background-size'] = `contain`;
    this.style['background-repeat'] = `no-repeat`;
    this.style['background-position'] = `top center`;
    this.style['cursor'] = this.editMode ? 'move' : '';
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
    this.renderDataRequest.emit();
  }

  showNameLabel(){
    this.showName = true;
  }

  hideNameLabel(){
    this.showName = false;
  }

  redirectTo(device: any, deviceAction: DeviceActions) {
    console.log("Redirect to", deviceAction);
    console.log("Device", device);
    this.onOpenButtonClick(device, deviceAction);
    return;
  }

  setTitleAttribute(itemData: any, editMode: boolean, action: string): string {

    const deviceName = itemData.device ? itemData.device.deviceName : itemData.name;

    switch (action) {
      case 'move':

        if(!editMode){
          if (itemData.device) return `Open ${deviceName} menu`;
          return deviceName;

        } else {

          const moveText = $localize`:@@HYT_draggableitem_move:Move`;
          return moveText + ' ' + deviceName;

        }

      case 'remove':

        if(!editMode){

          return deviceName;

        } else {

          const removeText = $localize`:@@HYT_draggableitem_remove:Remove`;
          return removeText + ' ' + deviceName;

        }

    }


  }

}
