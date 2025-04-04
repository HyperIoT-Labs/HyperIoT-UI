import { Component, ElementRef, EventEmitter, HostListener, ViewEncapsulation } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Area, AreaDevice, Dashboard, HDevice, LiveAlarmSelectors } from 'core';
import { DeviceActions, MapItemAction, UtilsService } from 'components';
import { Store } from '@ngrx/store';
import { Observable, map, tap } from 'rxjs';

@Component({
  selector: 'hyt-draggable-item',
  templateUrl: './draggable-item.component.html',
  styleUrls: ['./draggable-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DraggableItemComponent {
  openClicked = new EventEmitter<MapItemAction>();
  removeClicked = new EventEmitter<any>();
  positionChanged = new EventEmitter<any>();
  renderDataRequest = new EventEmitter<any>();

  deviceActions = DeviceActions;
  dataSource = Dashboard.DashboardTypeEnum;

  editMode = false;
  itemData: AreaDevice | Area;
  container;
  position = { x: 0, y: 0 };
  style: any = {};
  renderData: any = {};
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
    public utilsService: UtilsService
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.refresh();
  }

  onDragEnded(e) {
    const source: CdkDrag = e.source;
    const position = source.getFreeDragPosition();
    this.itemData.mapInfo.x = position.x / this.container.clientWidth;
    this.itemData.mapInfo.y = position.y / this.container.clientHeight;
    this.positionChanged.emit();
  }

  onRemoveButtonClick(e): void {
    this.removeClicked.emit();
  }

  setConfig(container: HTMLElement, areaItem: AreaDevice | Area): void {
    this.itemData = areaItem;
    this.container = container;
    this.deepHDeviceList = (areaItem as AreaDevice).device ? [ (areaItem as AreaDevice).device ] : (areaItem as any).deepDevices;
    this.style['background-image'] = `url(assets/icons/${this.itemData.mapInfo.icon})`;
    this.style['background-size'] = `contain`;
    this.style['background-repeat'] = `no-repeat`;
    this.style['background-position'] = `top center`;
    this.style['cursor'] = this.editMode ? 'move' : '';
    this.refresh();
  }

  setPosition(x: number, y: number): void {
    // normalize to view size
    this.itemData.mapInfo.x = x;
    this.itemData.mapInfo.y = y;
    this.refresh();
  }

  refresh(): void {
    this.position = {
      x: this.itemData.mapInfo.x * this.container.clientWidth,
      y: this.itemData.mapInfo.y * this.container.clientHeight
    };
    this.renderDataRequest.emit();
  }

  showNameLabel(): void {
    this.showName = true;
  }

  hideNameLabel(): void {
    this.showName = false;
  }

  redirectByMapItemAction(mapItemAction: MapItemAction): void {
    this.openClicked.emit(mapItemAction);
  }

  setTitleAttribute(itemData: any, editMode: boolean, action: string): string {
    const deviceName = itemData.device ? itemData.device.deviceName : itemData.name;

    switch (action) {
      case 'move':
        if (editMode) {
          const moveText = $localize`:@@HYT_draggableitem_move:Move`;
          return moveText + ' ' + deviceName;
        } else {
          if (itemData.device) {
            return `Open ${deviceName} menu`
          };
          return deviceName;
        }

      case 'remove':
        if (editMode) {
          const removeText = $localize`:@@HYT_draggableitem_remove:Remove`;
          return removeText + ' ' + deviceName;
        } else {
          return deviceName;
        }
    }
  }

}
