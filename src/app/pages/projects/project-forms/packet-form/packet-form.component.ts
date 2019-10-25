import { Component, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { FormBuilder } from '@angular/forms';

import { HPacket, HpacketsService, HDevice } from '@hyperiot/core';
import { Option } from '@hyperiot/components';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';

@Component({
  selector: 'hyt-packet-form',
  templateUrl: './packet-form.component.html',
  styleUrls: ['./packet-form.component.scss']
})
export class PacketFormComponent extends ProjectFormEntity implements OnDestroy {
  entity: HPacket = {} as HPacket;
  entityFormMap = {
    'hpacket-name': 'name',
    'hpacket-type': 'type',
    'hpacket-serialization': 'serialization',
    'hpacket-format': 'format',
    'hpacket-timestampfield': 'timestampField',
    'hpacket-timestampformat': 'timestampFormat',
    'hpacket-trafficplan': 'trafficPlan'
  };

  @Input()
  currentDevice: HDevice;

  id: number; // <-- this could be made private
  deviceName: '---';

  mqttUrl = '';
  mqttTopic = '';

  typeOptions: Option[] = Object.keys(HPacket.TypeEnum)
    .map((k) => ({ label: k, value: k }));

  serializationOptions: Option[] = Object.keys(HPacket.SerializationEnum)
    .map((k) => ({ label: k, value: k }));

  formatOptions: Option[] = Object.keys(HPacket.FormatEnum)
    .map((k) => ({ label: k, value: k }));

  trafficPlanOptions: Option[] = Object.keys(HPacket.TrafficPlanEnum)
    .map((k) => ({ label: k, value: k }));

  private routerSubscription: Subscription;

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
    this.longDefinition = 'packet long definition'; //@I18N@
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.id = this.activatedRoute.snapshot.params.packetId;
        this.load();
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  // ProjectDetailEntity interface
  save(successCallback, errorCallback) {
    this.savePacket(successCallback, errorCallback);
  }
  delete(successCallback, errorCallback) {
    this.deletePacket(successCallback, errorCallback);
  }

  load() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.hPacketService.findHPacket(this.id).subscribe((p: HPacket) => {
      this.entity = p;
      // update form data
      this.edit();
      // update static data (not part of this form)
      this.mqttUrl = 'tcp://karaf-activemq-mqtt-test.hyperiot.cloud';
      this.mqttTopic = '/v1/devices/' + p.device.id + '/' + p.id;
      // emit event for updating UI
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: p.id, type: 'packet'
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private savePacket(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();

    const p = this.entity;
    p.name = this.form.value['hpacket-name'];
    p.type = this.form.value['hpacket-type'];
    p.format = this.form.value['hpacket-format'];
    p.serialization = this.form.value['hpacket-serialization'];
    p.trafficPlan = this.form.value['hpacket-trafficplan'];
    p.timestampField = this.form.value['hpacket-timestampfield'];
    p.timestampFormat = this.form.value['hpacket-timestampformat'];

    const wasNew = this.isNew();
    const responseHandler = (res) => {
      this.entity = res;
      this.resetForm();
      this.entityEvent.emit({
        event: 'treeview:update',
        id: this.entity.id, type: 'packet', name: this.entity.name
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res, wasNew);
    };

    if (p.id) {
      this.hPacketService.updateHPacket(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
    else {
      p.entityVersion = 1;
      p.version = '1';
      p.fields = [];
      p.device = { id: this.currentDevice.id, entityVersion: this.currentDevice.entityVersion };
      this.hPacketService.saveHPacket(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
  }

  private deletePacket(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hPacketService.deleteHPacket(this.entity.id).subscribe((res) => {
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
      // request navigate to parent node (device page)
      this.entityEvent.emit({
        event: 'entity:delete',
        exitRoute: [
          '/projects', this.entity.device.project.id,
          { outlets: { projectDetails: ['device', this.entity.device.id] } }
        ]
      });
      this.entityEvent.emit({ event: 'treeview:refresh' });
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

}
