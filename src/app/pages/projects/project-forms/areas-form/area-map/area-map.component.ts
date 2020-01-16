import {
  Component,
  ComponentFactoryResolver,
  ViewChild,
  ComponentRef,
  ElementRef,
  HostListener,
  EventEmitter
} from '@angular/core';
import { DraggableItemComponent } from '../draggable-item/draggable-item.component';
import { MapDirective } from '../map.directive';
import { AreaDevice } from '@hyperiot/core';

@Component({
  selector: 'hyt-area-map',
  templateUrl: './area-map.component.html',
  styleUrls: ['./area-map.component.scss']
})
export class AreaMapComponent {
  @ViewChild(MapDirective, {static: true})
  mapContainer: MapDirective;
  @ViewChild('mapBoundary', {static: true})
  mapBoundary: ElementRef;
  mapImageSize = { width: 800, height: 600 };
  // events
  itemRemove = new EventEmitter<any>();
  itemUpdate = new EventEmitter<any>();

  private mapComponents = [] as ComponentRef<DraggableItemComponent>[];

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.refresh();
  }

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  addAreaDeviceItem(areaDevice: AreaDevice) {
    const container = this.mapContainer.viewContainerRef.element.nativeElement.parentElement;
    const component = this.addItem();
    component.instance.setConfig(container, areaDevice);
  }

  setDevices(devices: AreaDevice[]) {
    this.reset();
    const container = this.mapContainer.viewContainerRef.element.nativeElement.parentElement;
    devices.forEach((d) => {
      this.addItem().instance.setConfig(container, d);
    });
  }
  setMapImage(imageUrl: string, width: number, height: number) {
    this.mapImageSize = { width, height };
    this.mapBoundary.nativeElement.style['background-image'] = `url(${imageUrl})`;
    this.refresh();
  }

  addItem(): ComponentRef<DraggableItemComponent> {
    const componentFactory = this.componentFactoryResolver
      .resolveComponentFactory(DraggableItemComponent);
    const viewContainerRef = this.mapContainer.viewContainerRef;
    const component = viewContainerRef.createComponent(componentFactory);
    // handle component removal
    component.instance.removeClicked.subscribe(() => {
      this.removeItem(component);
    });
    component.instance.positionChanged.subscribe(() => {
      this.updateItem(component);
    });
    this.mapComponents.push(component);
    return component;
  }
  removeItem(component: ComponentRef<DraggableItemComponent>, disableEvent?: boolean) {
    const viewContainerRef = this.mapContainer.viewContainerRef;
    const idx = viewContainerRef.indexOf(component.hostView);
    viewContainerRef.remove(idx);
    this.mapComponents.splice(this.mapComponents.indexOf(component), 1);
    if (!disableEvent) {
      this.itemRemove.emit(component.instance.itemData);
    }
  }
  updateItem(component: ComponentRef<DraggableItemComponent>) {
    this.itemUpdate.emit(component.instance.itemData);
  }

  refresh() {
    const boundary: HTMLElement = this.mapBoundary.nativeElement;
    const mapHost = boundary.parentElement.parentElement;
    boundary.style.width = mapHost.clientWidth + 'px';
    const h = boundary.clientWidth / this.mapImageSize.width * this.mapImageSize.height;
    boundary.style.height = h + 'px';
    this.mapComponents.forEach((c) => c.instance.refresh());
  }

  reset() {
    this.mapComponents.slice().forEach((c) => this.removeItem(c, true));
    this.mapBoundary.nativeElement.style['background-image'] = null;
  }

}
