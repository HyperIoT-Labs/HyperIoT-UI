import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService, HPacket, PacketData } from 'core';
import { Subscription } from 'rxjs';

import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';
import { BodyMapAssociation } from '../../dashboard/widget-settings-dialog/bodymap-settings/bodymap.model';

@Component({
  selector: 'hyperiot-bodymap',
  templateUrl: './bodymap.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './bodymap.component.scss'],
})
export class BodymapComponent extends BaseGenericComponent implements OnInit {
  @ViewChild('bodyMap') bodyMap: ElementRef;
  // @ViewChild('target', { read: ViewContainerRef }) entry: ViewContainerRef;

  // @ViewChild('contentWidget', { read: ViewContainerRef }) contentWidgetContainer: ViewContainerRef;
  // @ViewChild('missingConfig', { read: TemplateRef }) missingConfigTemplate: TemplateRef<any>;
  // @ViewChild('configured', { read: TemplateRef }) configuredTemplate: TemplateRef<any>;

  // STREAM PROPERTY
  isPaused = false;

  protected dataChannelList: DataChannel[] = [];
  dataSubscription: Subscription;
  public svgImage: string | undefined;

  musclesMap: BodyMapAssociation[] = [];

  protected logger: Logger;

  constructor(
    injector: Injector,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(BodymapComponent.name);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.configure();
  }

  configure(): void {
    super.removeSubscriptionsAndDataChannels();
    if (!this.serviceType) {
      this.logger.error('TYPE SERVICE UNDEFINED');
      return;
    }

    super.configure();

    if (
      !(
        this.widget.config != null
      )
    ) {
      // this.contentWidgetContainer.clear();
      // this.contentWidgetContainer.createEmbeddedView(this.missingConfigTemplate);
      this.isConfigured = false;
      return;
    }
    // this.contentWidgetContainer.clear();
    // this.contentWidgetContainer.createEmbeddedView(this.configuredTemplate);
    this.isConfigured = true;

    this.svgImage = this.widget.config?.svgImage;
    this.musclesMap = this.widget.config.musclesMap;

    const packetList: HPacket[] = [];
    this.musclesMap.forEach(association => {
      association.packets.forEach(packet => {
        if (!packetList.some(p => p.id === packet.id)) {
          packetList.push(packet);
        }
      });
    });
    this.subscribeDataChannel(packetList);
  }

  subscribeDataChannel(packetList: HPacket[]) {
    const dataPacketFilterList = packetList.map(packet => new DataPacketFilter(packet.id, [], true));
    const dataChannel = this.dataService.addDataChannel(+this.widget.id, dataPacketFilterList);
    this.dataSubscription = dataChannel.subject.subscribe(
      (eventData) => this.computePacketDataBM(eventData.data, eventData.packetId)
    );
    this.dataChannelList.push(dataChannel);
  }

  computePacketDataBM(packetData: PacketData[], packetId: number) {

    this.animateElement(packetId);

  }

  animateElement(packetId: number) {
    const musclesAnimation: BodyMapAssociation[] = this.widget.config.musclesMap.filter(x => x.packets.some(p => p.id === packetId));

    musclesAnimation.forEach(ma => {
      ma.muscleIds.forEach(muscleId => {
        const element = this.bodyMap.nativeElement.querySelector('#' + muscleId);
        if (element) { 
          element.animate([
            { fill: ma.color },
          ], {
            duration: 200,
            iterations: 2,
            direction: 'alternate',
            easing: 'ease-in-out',
          });
        }
      });
    });

  }

  play(): void {
    this.isPaused = false;
    this.dataChannelList.forEach(dataChannel => dataChannel.controller.play());
  }

  pause(): void {
    this.isPaused = true;
    this.dataChannelList.forEach(dataChannel => dataChannel.controller.pause());
  }

  onToolbarAction(action: string) {
    switch (action) {
      case 'toolbar:play':
        this.play();
        break;
      case 'toolbar:pause':
        this.pause();
        break;
    }

    this.widgetAction.emit({ widget: this.widget, action });
  }

}
