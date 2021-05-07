import { Component, OnDestroy, ViewChild, ElementRef, Input, Injector, ViewEncapsulation, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { HPacket, HpacketsService, HDevice } from '@hyperiot/core';
import { Option } from '@hyperiot/components';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'hyt-packet-form',
  templateUrl: './packet-form.component.html',
  styleUrls: ['./packet-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PacketFormComponent extends ProjectFormEntity implements AfterViewInit, OnDestroy {

  private overlayHeight: ElementRef;
  showPreloader: boolean;
  divHeight: number;

  @ViewChild('overlayHeight') set content(content: ElementRef) {

    if (!content) {

      this.showPreloader = false;
      return;

    } else {

      this.showPreloader = true;
      this.overlayHeight = content;
      this.divHeight = this.overlayHeight.nativeElement.clientHeight;

    }

  }

  entityFormMap = {
    'hpacket-name': {
      field: 'name',
      default: null
    },
    'hpacket-type': {
      field: 'type',
      default: 'INPUT'
    },
    'hpacket-serialization': {
      field: 'serialization',
      default: 'NONE'
    },
    'hpacket-format': {
      field: 'format',
      default: 'JSON'
    },
    'hpacket-unixTimestamp': {
      field: 'unixTimestamp',
      default: 'true'
    },
    'hpacket-unixTimestampFormatSeconds': {
      field: 'unixTimestampFormatSeconds',
      default: 'false'
    },
    'hpacket-timestampfield': {
      field: 'timestampField',
      default: 'timestamp'
    },
    'hpacket-timestampformat': {
      field: 'timestampFormat',
      default: 'dd/MM/yyyy hh.mmZ'
    },
    'hpacket-trafficplan': {
      field: 'trafficPlan',
      default: 'LOW'
    },
    'hpacket-entityVersion':{
      field: 'entityVersion',
      default: 1
    }
  };
  

  @Input()
  currentDevice: HDevice;

  id: number; // <-- this could be made private
  deviceName: '---';

  mqttUrl;
  //Streaming topic
  mqttTopic;
  //read topic
  mqttReadTopic;

  typeOptions: Option[] = Object.keys(HPacket.TypeEnum)
    .map((k) => ({ label: k, value: k }));

  serializationOptions: Option[] = Object.keys(HPacket.SerializationEnum)
    .map((k) => ({ label: k, value: k }));

  formatOptions: Option[] = Object.keys(HPacket.FormatEnum)
    .map((k) => ({ label: k, value: k }));

  trafficPlanOptions: Option[] = Object.keys(HPacket.TrafficPlanEnum)
    .map((k) => ({ label: k, value: k }));

  timestampTypeOptions : Option[] = [{
      label:"String",
      value: 'false'
    },{
      label:"UNIX Timestamp"
      ,value: 'true' ,checked:true}]

  unixTimestampOptions : Option[] = [{
        label:"Seconds",
        value: 'true'
      },{
        label:"Milliseconds"
        ,value: 'false' ,checked:true}]



  private routerSubscription: Subscription;


  constructor(
    injector: Injector,
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
    this.formTemplateId = 'container-packet-form';
    this.longDefinition = this.entitiesService.packet.longDefinition;
    this.formTitle = this.entitiesService.packet.formTitle;
    this.icon = this.entitiesService.packet.icon;
  }

  ngAfterViewInit(): void {

    super.ngAfterViewInit();
    this.routerSubscription = this.activatedRoute.params.subscribe(params => {
      if (params.packetId) {
        this.id = params.packetId;
        this.load();
      } else {
        this.loadEmpty();
      }
      this.cdr.detectChanges();
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

    /******* VALUE LOADING OVERLAY *******/

    setTimeout(() => {

      this.divHeight = this.overlayHeight.nativeElement.clientHeight;

    }, 0);

    this.cdr.detectChanges();

    /******* END VALUE LOADING OVERLAY *******/

    this.hPacketService.findHPacket(this.id).subscribe((p: HPacket) => {
      this.entity = p;
      // update form data
      this.edit();
      // update static data (not part of this form)
      this.defineTopics(this.entity);
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

  loadEmpty() {
    this.form.reset();
    this.entity = this.newEntity();
    this.edit();
  }

  hpacketTypeChange(event){
    this.entity.type = event;
    this.defineTopics(this.entity);
  }

  private defineTopics(packet:HPacket){
    this.mqttUrl = environment.mqttUrl;
    if(packet.type == "INPUT" || packet.type == "IO"){
      this.mqttTopic = 'streaming/' + packet.device.project.id + '/' + packet.device.id + '/' + packet.id;
    } else {
      this.mqttTopic = null;
    }

    if(packet.type == "OUTPUT" || packet.type == "IO"){
      this.mqttReadTopic = '/'+packet.device.id+"/receive";
    } else {
      this.mqttReadTopic = null;
    }
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
    p.unixTimestamp =  (/true/i).test(this.form.value['hpacket-unixTimestamp']);
    p.unixTimestampFormatSeconds = (/true/i).test(this.form.value['hpacket-unixTimestampFormatSeconds']);

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
    } else {
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
      this.loadingStatus = LoadingStatusEnum.Ready;
      // request navigate to parent node (device page)
      this.entityEvent.emit({
        event: 'entity:delete',
        exitRoute: 'project'
        // exitRoute: [
        //'/projects', this.entity.device.project.id,
        // { outlets: { projectDetails: ['device', this.entity.device.id] } }
        // ]
      });
      this.entityEvent.emit({ event: 'treeview:refresh' });
      successCallback && successCallback(res);
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  setErrors(err) {

    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ message: $localize`:@@HYT_unavailable_packet_name:Unavailable packet name`, field: 'hpacket-name', invalidValue: '' }];
          this.form.get('hpacket-name').setErrors({
            validateInjectedError: {
              valid: false
            }
          });
          this.loadingStatus = LoadingStatusEnum.Ready;
          break;
        }
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
          super.setErrors(err);
          break;
        }
        default: {
          this.loadingStatus = LoadingStatusEnum.Error;
        }
      }
    } else {
      this.loadingStatus = LoadingStatusEnum.Error;
    }

  }

  getCustomClass() {

    if (this.showPreloader) {

      if (this.divHeight > 353) { /* BIG */
        return 'loading-logo display-logo big-bg';
      }

      if (this.divHeight >= 293 && this.divHeight <= 352) { /* MEDIUM */
        return 'loading-logo display-logo medium-bg';
      }

      if (this.divHeight >= 233 && this.divHeight <= 292) { /* SMALL */
        return 'loading-logo display-logo small-bg';
      }

      if (this.divHeight >= 182 && this.divHeight <= 232) { /* X-SMALL */
        return 'loading-logo display-logo x-small-bg';
      }

      if (this.divHeight < 182) { /* X-SMALL */
        return '';
      }

    } else {
      return '';
    }

  }

}
