import { Component, OnInit, ComponentFactoryResolver, ViewChild, ComponentRef, ElementRef, HostListener } from '@angular/core';
import { DraggableItemComponent } from '../draggable-item/draggable-item.component';
import { MapDirective } from '../map.directive';

export class AreaDeviceConfig {
  id: number;
  name: string;
  icon: string;
  position: { x: number, y: number };
  status?: string;
  container?: HTMLElement; /* for internal use */
  constructor() {
    this.position = { x: .5, y: .5 };
  }
}
export class AreaConfig {
  devices: AreaDeviceConfig[];
}

@Component({
  selector: 'hyt-area-map',
  templateUrl: './area-map.component.html',
  styleUrls: ['./area-map.component.scss']
})
export class AreaMapComponent implements OnInit {
  @ViewChild(MapDirective, {static: true})
  mapContainer: MapDirective;
  @ViewChild('mapBoundary', {static: true})
  mapBoundary: ElementRef;
  deviceIcon = 'move-sensor.png';

  private mapComponents = [] as ComponentRef<DraggableItemComponent>[];

  private areaConfig: AreaConfig = {
    devices: [
      { id: 100, name: 'device-1', position: { x: 0.3710, y: 0.5737 }, icon: 'gps-sensor.png' },
      { id: 101, name: 'device-2', position: { x: 0.7132, y: 0.7535 }, icon: 'body-scanner.png' },
      { id: 102, name: 'device-3', position: { x: 0.5137, y: 0.8565 }, icon: 'motion-sensor.png' },
      { id: 103, name: 'device-4', position: { x: 0.6606, y: 0.4141 }, icon: 'door-sensor.png' },
      { id: 104, name: 'device-5', position: { x: 0.2011, y: 0.4535 }, icon: 'thermometer.png' }
    ]
  };

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.refresh();
  }

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.loadConfig();
  }

  onAddClick(e) {
    const container = this.mapContainer.viewContainerRef.element.nativeElement.parentElement;
    const component = this.addItem();
    const cfg = new AreaDeviceConfig();
    cfg.icon = this.deviceIcon;
    component.instance.setConfig(container, cfg);
    // TODO: should add component cfg to 'areaConfig.devices' as well
  }

  loadConfig() {
    // TODO: should reset current configuration and remove actual draggable items
    this.areaConfig.devices.forEach((d) => {
      const container = this.mapContainer.viewContainerRef.element.nativeElement.parentElement;
      const component = this.addItem();
      component.instance.setConfig(container, d);
    });
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
    this.mapComponents.push(component);
    return component;
  }
  removeItem(component: ComponentRef<DraggableItemComponent>) {
    const viewContainerRef = this.mapContainer.viewContainerRef;
    const idx = viewContainerRef.indexOf(component.hostView);
    viewContainerRef.remove(idx);
    this.mapComponents.splice(this.mapComponents.indexOf(component), 1);
    // TODO: should remove it from 'areaConfig.devices' as well
  }

  refresh() {
    const boundary: HTMLElement = this.mapBoundary.nativeElement;
    const mapHost = boundary.parentElement.parentElement;
    boundary.style.width = mapHost.clientWidth + 'px';
    // TODO: should resize height proportionally to background image aspect ratio w/h
    //boundary.style.height = mapHost.clientHeight + 'px';
console.log(mapHost.clientHeight);
    this.mapComponents.forEach((c) => c.instance.refresh());
  }

}
