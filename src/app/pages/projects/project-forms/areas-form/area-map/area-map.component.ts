
/*
 *
 *  Copyright 2019-2023 HyperIoT
 *
 *  Licensed under the Apache License, Version 2.0 (the "License")
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *
 */

import {
  Component,
  ComponentFactoryResolver,
  ViewChild,
  ComponentRef,
  ElementRef,
  HostListener,
  EventEmitter,
  Input,
  Output, OnDestroy
} from '@angular/core';
import { DeviceActions, DraggableItemComponent } from '../draggable-item/draggable-item.component';
import { MapDirective } from '../map.directive';
import {AreaDevice, Area, Logger, LoggerService} from 'core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'hyt-area-map',
  templateUrl: './area-map.component.html',
  styleUrls: ['./area-map.component.scss']
})


export class AreaMapComponent implements OnDestroy {
  /**
   * Listener on map area
   */
  @ViewChild(MapDirective, {static: true})
  mapContainer: MapDirective;
  /**
   * Listener on Container map area
   */
  @ViewChild('mapBoundary', {static: true})
  mapBoundary: ElementRef;
  /**
   * Measurements of the map area
   */
  mapImageSize = { width: 800, height: 600 };
  /**
   * Input variable for managing the map editing mode
   */
  @Input()
  editMode = false;
  /**
   * Output event group
   */
  @Output()
  itemOpen = new EventEmitter<any>();
  itemRemove = new EventEmitter<any>();
  itemUpdate = new EventEmitter<any>();
  renderDataRequest = new EventEmitter<DraggableItemComponent>();
  /**
   * Management of displaying the image overlay on the map media
   */
  overlayIsVisible = true;
  /**
   * Message present in the overlay that will be set by the parent component
   */
  overlayMsg = '';
  /**
   * Array containing the components present in the map
   */
  private mapComponents = [] as ComponentRef<DraggableItemComponent>[];
  /*
   * logger service
   */
  private logger: Logger;
  /**
   * Subject for manage the open subscriptions
   * @protected
   */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  /**
   * Listener on the window resize event
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event) {

    this.refresh();

  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private loggerService: LoggerService
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('AreaMapComponent');
  }
  ngOnDestroy() {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }

  /**
   * Management of the overlay level on the map media
   * @param value
   * @param msg
   */
  setOverlayLevel(value: boolean, msg: string) {
    this.overlayIsVisible = value;
    this.overlayMsg = msg;
  }

  /**
   * Function to add element on the map
   * @param areaItem
   */
  addAreaItem(areaItem: AreaDevice | Area) {
    this.logger.debug('addAreaItem function');
    const container = this.mapContainer.viewContainerRef.element.nativeElement.parentElement;
    const component = this.addItem();
    component.instance.setConfig(container, areaItem);
  }

  /**
   * Set Item on the map
   * @param items
   */
  setAreaItems(items: (AreaDevice | Area)[]) {
    this.logger.debug('setAreaItems function');
    this.reset();
    const container = this.mapContainer.viewContainerRef.element.nativeElement.parentElement;
    items.forEach((d) => {
      this.addItem().instance.setConfig(container, d);
    });
  }

  /**
   * Set background image area map
   * @param imageUrl
   * @param width
   * @param height
   */
  setMapImage(imageUrl: string, width: number, height: number) {
    this.logger.debug('setMapImage function');
    this.mapImageSize = { width, height };
    this.mapBoundary.nativeElement.style['background-image'] = `url(${imageUrl})`;
    this.refresh();
  }

  /**
   * Unset background image area map
   */
  unsetMapImage() {
    this.logger.debug('unsetMapImage function');
    this.mapBoundary.nativeElement.style['background-image'] = null;
  }

  /**
   * Add single item on the Area map
   */
  addItem(): ComponentRef<DraggableItemComponent> {
    const componentFactory = this.componentFactoryResolver
      .resolveComponentFactory(DraggableItemComponent);
    const viewContainerRef = this.mapContainer.viewContainerRef;
    const component = viewContainerRef.createComponent(componentFactory);
    // enable/disable editMode
    component.instance.editMode = this.editMode;
    // handle click on component label (open button)
    component.instance.openClicked
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((deviceAction: DeviceActions) => {
        this.openItem(component, deviceAction);
    });
    // handle component removal
    component.instance.removeClicked
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
      this.removeItem(component);
    });
    // handle position change
    component.instance.positionChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
      this.updateItem(component);
    });
    // handle render data request to render custom data
    component.instance.renderDataRequest
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
      this.renderDataRequest.emit(component.instance);
    });
    this.mapComponents.push(component);
    return component;
  }

  /**
   * Open item emit event
   * @param component
   * @param disableEvent
   */
  openItem(component: ComponentRef<DraggableItemComponent>, deviceAction?: DeviceActions) {
    if (deviceAction) this.itemOpen.emit({item: component.instance.itemData, deviceAction});
    else this.itemOpen.emit(component.instance.itemData);
  }

  /**
   * Remove item from the area map
   * @param component
   * @param disableEvent
   */
  removeItem(component: ComponentRef<DraggableItemComponent>, disableEvent?: boolean) {
    const viewContainerRef = this.mapContainer.viewContainerRef;
    const idx = viewContainerRef.indexOf(component.hostView);
    viewContainerRef.remove(idx);
    this.mapComponents.splice(this.mapComponents.indexOf(component), 1);
    if (!disableEvent) {
      this.itemRemove.emit(component.instance.itemData);
    }
  }

  /**
   * Emit event of update item on the map
   * @param component
   */
  updateItem(component: ComponentRef<DraggableItemComponent>) {
    this.itemUpdate.emit(component.instance.itemData);
  }

  /**
   * Update map bounduary element
   */
  refresh() {

    const boundary: HTMLElement = this.mapBoundary.nativeElement;
    const mapHost = boundary.parentElement.parentElement;

    if (mapHost) {

      boundary.style.maxWidth = mapHost.clientWidth + 'px'; /* modified from 'boundary.style.width' */
      const h = boundary.clientWidth / this.mapImageSize.width * this.mapImageSize.height;
      boundary.style.height = h + 'px';

    }

    this.mapComponents.forEach((c) => c.instance.refresh());

  }

  /**
   * Reset map from items
   */
  reset() {
    this.mapComponents.slice().forEach((c) => this.removeItem(c, true));
  }

}
