import { Component, ElementRef, EventEmitter, HostListener, ViewEncapsulation } from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';
import { AreaDevice, HDevice, LiveAlarmSelectors } from 'core';
import { DeviceActions } from 'components';
import { Store } from '@ngrx/store';
import { Observable, map, tap } from 'rxjs';

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

  alarmInfo$: Observable<any> = this.store.select(LiveAlarmSelectors.selectAllLiveAlarms).pipe(
    map(allLiveAlarms => allLiveAlarms.filter(x => x.deviceIds.some(y => this.deepHDeviceList.map(z => z.id).includes(y)))),
    tap(allLiveAlarms => {
      if (allLiveAlarms.length) {
        const alarmByMaxSeverity = allLiveAlarms.reduce((maxSeverityAlarm, alarm) => {
          return alarm.event.severity > maxSeverityAlarm.event.severity ? alarm : maxSeverityAlarm;
        }, allLiveAlarms[0]);
        const nativeElement = this.elRef.nativeElement;
        nativeElement.style.setProperty('--alarm-badge-color', alarmByMaxSeverity.color.background);
      }
    }),
  );

  /**
   * flat device list linked to this item used to filter alarms
   */
  deepHDeviceList: HDevice[] = [];

  constructor(
    private store: Store,
    private elRef: ElementRef,
  ) { }

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
    this.deepHDeviceList = this.itemData.device ? [ this.itemData.device ] : this.itemData.deepDevices;
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
