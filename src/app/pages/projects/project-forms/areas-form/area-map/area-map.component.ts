import { Component, OnInit, ComponentFactoryResolver, ViewChild, ComponentRef } from '@angular/core';
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
  deviceIcon = 'move-sensor.png';

  private areaConfig: AreaConfig = {
    devices: [
      { id: 100, name: 'device-1', position: { x: 0.2, y: 0.2 }, icon: 'gps-sensor.png' },
      { id: 101, name: 'device-2', position: { x: 0.4, y: 0.4 }, icon: 'body-scanner.png' },
      { id: 102, name: 'device-3', position: { x: 0.6, y: 0.6 }, icon: 'motion-sensor.png' },
      { id: 103, name: 'device-4', position: { x: 0.8, y: 0.8 }, icon: 'door-sensor.png' },
    ]
  };

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.areaConfig.devices.forEach((d) => {
      const container = this.mapContainer.viewContainerRef.element.nativeElement.parentElement;
      const component = this.addItem();
      component.instance.setConfig(container, d);
    });
  }

  onAddClick(e) {
    const container = this.mapContainer.viewContainerRef.element.nativeElement.parentElement;
    const component = this.addItem();
    const cfg = new AreaDeviceConfig();
    cfg.icon = this.deviceIcon;
    component.instance.setConfig(container, cfg);
    // TODO: should add component cfg to 'areaConfig.devices' as well
  }

  addItem(): ComponentRef<DraggableItemComponent> {
    const componentFactory = this.componentFactoryResolver
      .resolveComponentFactory(DraggableItemComponent);
    const viewContainerRef = this.mapContainer.viewContainerRef;
    const component = viewContainerRef.createComponent(componentFactory);
    // handle component removal
    component.instance.removeClicked.subscribe(() => {
        const idx = viewContainerRef.indexOf(component.hostView);
        viewContainerRef.remove(idx);
        // TODO: should remove it from 'areaConfig.devices' as well
    });
    return component;
  }

}
