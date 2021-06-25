import { Component, Input, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Option, SelectOption } from '@hyperiot/components';
import { HPacket, HPacketField, HpacketsService } from '@hyperiot/core';
import { environment } from 'src/environments/environment';
import { EventComponent } from '../event-component';
import { EventComponentType } from '../event-component-type.enum';

@Component({
  selector: 'hyt-event-mqtt-command',
  templateUrl: './event-mqtt-command.component.html',
  styleUrls: ['./event-mqtt-command.component.scss']
})
export class EventMqttCommandComponent implements OnInit,EventComponent {

  @Input()
  currentProjectId;
  
  mqttFieldsFormGroup :FormGroup =  new FormGroup({
    
  });

  private originalFormsValues = '';
  
  currentOutputPacket: HPacket;
  currentOutputPacketId;
  
  allPackets:HPacket[];
  fieldsOptions:Option[];
  packetOptions: SelectOption[] = [];
  packetsPromise: Promise<HPacket[]>;

  mqttUrl:string = environment.mqttUrl;
  mqttTopic:string;
  
  activeOptions: Option[] = [
    { value: "true", label: $localize`:@@HYT_send_mqtt_command_active:ACTIVE`, checked: true },
    { value: "false", label: $localize`:@@HYT_send_mqtt_command_disabled:DISABLED`}
    // { value: '', label: $localize`:@@HYT_start_statistic:START STATISTIC` }
  ];

  constructor(private hPacketsService: HpacketsService,private cd: ChangeDetectorRef) { 
    this.originalFormsValues = this.getJsonForms();
  }

  ngOnInit(): void {
    this.getHPackets();
  }

  getId(): string {
    throw EventComponentType.SEND_MQTT_COMMAND_ACTION;
  }

  reset(): void {
    this.mqttFieldsFormGroup.reset();
  }

  setData(dataArr): void {
    const data = JSON.parse(dataArr[0]);
    if(data && data["packetId"]){
      this.packetChanged(data["packetId"],data);
    }
  }

  buildJsonAction(): any {
    let innerJSON = {};

    let action = {
      actionName: EventComponentType.SEND_MQTT_COMMAND_ACTION,
      packetId:this.mqttFieldsFormGroup.get("packet").value,
      packetFormat: this.currentOutputPacket.format,
      active: this.mqttFieldsFormGroup.get("active").value,
      topic: this.mqttTopic,
      message : ""
    };

    this.currentOutputPacket.fields.forEach(field => {
      innerJSON[field.name] = this.mqttFieldsFormGroup.get(field.name).value;
    })

    action.message = JSON.stringify(innerJSON);
    const jActions = [JSON.stringify(action)];
    let jActionStr = JSON.stringify(jActions);
    return jActionStr;
  }

  buildFieldOptions(hPacket: HPacket):Option[] {
    let fieldList: HPacketField[] = [];
    let fieldFlatList = [];
    fieldList = this.treefy(hPacket.fields);
    this.extractField(fieldList,fieldFlatList);
    return fieldFlatList.map(f => ({ value: f.label, label: f.field.name }));
  }

  extractField(fieldArr: HPacketField[],fieldFlatList, pre?: string) {
    fieldArr.forEach(f => {
      const fieldName: string = pre ? pre + '.' + f.name : f.name;
      fieldFlatList.push({ field: f, label: fieldName });
      if (f.innerFields) {
        this.extractField(f.innerFields, fieldName);
      }
    });
  }

  treefy(fieldList: HPacketField[]): HPacketField[] {
    const treefiedFields = [];
    fieldList.forEach(x => {
      const parent: HPacketField = this.findParent(fieldList, x);
      if (parent && !treefiedFields.some(y => y.id === parent.id)) {
        treefiedFields.push(parent);
      }
    });
    return treefiedFields;
  }

  findParent(fieldList: HPacketField[], packetField: HPacketField): HPacketField {
    const parent: HPacketField = fieldList.find(x => x.innerFields.some(y => y.id === packetField.id));
    if (parent) {
      return this.findParent(fieldList, parent);
    } else {
      return packetField;
    }
  }

  isInvalid(): boolean {
    return false;
  }

  isDirty(): boolean {
    return this.getJsonForms() !== this.originalFormsValues;
  }

  packetChanged(packetId,data?){
    if(packetId > 0){
      this.currentOutputPacketId = packetId;
      this.getHPackets().then(packets => {
        let packet = packets.find(packet => packet.id === packetId)
        this.mqttTopic = "/"+packet.device.id+"/receive"
        this.addOrUpdateFormControls(packet,data);
        this.originalValueUpdate();
        this.currentOutputPacket = packet;
      })
    }
  }

  inputChanged(target,fieldName){
    this.mqttFieldsFormGroup.get(fieldName).setValue(target.value);
  }

  changeEventActive(event){
    this.mqttFieldsFormGroup.get("active").setValue(event);
  }

  private addOrUpdateFormControls(packet:HPacket,data?){
    if(packet){
      this.fieldsOptions = this.buildFieldOptions(packet);
      this.fieldsOptions.forEach(field => {
        if(!this.mqttFieldsFormGroup.get(field.label)){
          this.mqttFieldsFormGroup.addControl(field.label,new FormControl());
        }
        if(data){
            //converting option value to string (it can be also boolean or number)
            let fieldName = (field.value != null && field.value != undefined)?""+field.value:null;
            let jsonValue = JSON.parse(data.message);
            this.mqttFieldsFormGroup.get(field.label).setValue(jsonValue[fieldName]);
            
        }
      })
      if(data)
        this.mqttFieldsFormGroup.get("active").setValue(data.active);
      this.mqttFieldsFormGroup.get("packet").setValue(packet.id);
      this.cd.detectChanges();
    }
  }

  private originalValueUpdate() {
    this.originalFormsValues = this.getJsonForms();
  }

  private getJsonForms(): string {
    return JSON.stringify(this.mqttFieldsFormGroup.value);
  }

  private getHPackets() : Promise<HPacket[]> {
      if(this.allPackets && this.allPackets.length > 0)
        return new Promise((resolve,reject) => {
          resolve(this.allPackets);
        });
      else
        return new Promise((resolve,reject) => {
          this.hPacketsService.findAllHPacketByProjectIdAndType(this.currentProjectId,"OUTPUT,IO").toPromise().then(res => {
            this.allPackets = res;
            if(this.allPackets.length === 0){
              this.packetOptions = [{label:"No output packets defined",value:"-1"}]
            } else {
              this.packetOptions = this.allPackets.map(p => ({ label: p.name, value: p.id }));
            }
            resolve(this.allPackets);
          })
        });
  }
}
