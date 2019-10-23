import { Component, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { FormBuilder } from '@angular/forms';

import { HPacket, HpacketsService, HDevice } from '@hyperiot/core';
import { Option } from '@hyperiot/components';

import { ProjectDetailEntity, LoadingStatusEnum, SubmitMethod } from '../project-detail-entity';

@Component({
  selector: 'hyt-packet-data',
  templateUrl: './packet-data.component.html',
  styleUrls: ['./packet-data.component.scss']
})
export class PacketDataComponent extends ProjectDetailEntity implements OnDestroy {

  @Input()
  currentDevice: HDevice;

  packetId: number;
  packet: HPacket = {} as HPacket;
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
    this.routerSubscription = this.router.events.subscribe((rl) => {
      this.submitMethod = SubmitMethod.Put;
      if (rl instanceof NavigationEnd) {
        this.packetId = this.activatedRoute.snapshot.params.packetId;
        this.loadPacket();
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

  private loadPacket() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.packet = p;
      // update form data
      this.form.get('hpacket-name')
        .setValue(p.name);
      this.form.get('hpacket-type')
        .setValue(p.type);
      this.form.get('hpacket-serialization')
        .setValue(p.serialization);
      this.form.get('hpacket-format')
        .setValue(p.format);
      this.form.get('hpacket-timestampfield')
        .setValue(p.timestampField);
      this.form.get('hpacket-timestampformat')
        .setValue(p.timestampFormat);
      this.form.get('hpacket-trafficplan')
        .setValue(p.trafficPlan);
      // update static data (not part of this form)
      this.mqttUrl = 'tcp://karaf-activemq-mqtt-test.hyperiot.cloud';
      this.mqttTopic = '/v1/devices/' + p.device.id + '/' + p.id;
      // reset form
      this.resetForm();
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

    const responseHandler = (res) => {
      this.packet = res;
      if (this.submitMethod == SubmitMethod.Post)
        this.cleanForm();
      else
        this.resetForm();
      this.entityEvent.emit({
        event: 'treeview:update',
        id: this.packet.id, type: 'packet', name: this.packet.name
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    };

    if (this.submitMethod == SubmitMethod.Post) {
      let p: HPacket = {
        entityVersion: 1,
        name: this.form.value['hpacket-name'],
        type: this.form.value['hpacket-type'],
        format: this.form.value['hpacket-format'],
        serialization: this.form.value['hpacket-serialization'],
        fields: [],
        trafficPlan: this.form.value['hpacket-trafficplan'],
        timestampField: this.form.value['hpacket-timestampfield'], //'timestampField',
        timestampFormat: this.form.value['hpacket-timestampformat'], //'dd/MM/yyyy HH.mmZ',
        version: '1',
        device: { id: this.currentDevice.id, entityVersion: this.currentDevice.entityVersion }
      }
      this.hPacketService.saveHPacket(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
    else {
      let p = this.packet;
      p.name = this.form.get('hpacket-name').value;
      p.type = this.form.get('hpacket-type').value;
      p.serialization = this.form.get('hpacket-serialization').value;
      p.format = this.form.get('hpacket-format').value;
      p.timestampField = this.form.get('hpacket-timestampfield').value;
      p.timestampFormat = this.form.get('hpacket-timestampformat').value;
      p.trafficPlan = this.form.get('hpacket-trafficplan').value;
      this.hPacketService.updateHPacket(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
  }

  private deletePacket(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hPacketService.deleteHPacket(this.packet.id).subscribe((res) => {
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
      // Navigate to parent node (device page)
      this.router.navigate([
        '/projects', this.packet.device.project.id,
        { outlets: { projectDetails: ['device', this.packet.device.id] } }
      ]);
      this.entityEvent.emit({ event: 'treeview:refresh' });
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

}
