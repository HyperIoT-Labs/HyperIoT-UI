import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Option, SelectOption } from '@hyperiot/components';
import { HPacket, HPacketField, HpacketsService } from '@hyperiot/core';
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
  
  activeOptions: Option[] = [
    { value: "true", label: $localize`:@@HYT_send_mqtt_command_active:ACTIVE`, checked: true },
    { value: "false", label: $localize`:@@HYT_send_mqtt_command_disabled:DISABLED`}
    // { value: '', label: $localize`:@@HYT_start_statistic:START STATISTIC` }
  ];

  constructor(private hPacketsService: HpacketsService) { }

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
    if(data && data["packet"]){
      this.packetChanged(data["packet"],data);
    }
  }

  buildJsonAction(): any {
    let action = {
      actionName: EventComponentType.SEND_MQTT_COMMAND_ACTION,
      packet:this.mqttFieldsFormGroup.get("packet").value,
      active: this.mqttFieldsFormGroup.get("active").value
    };
    this.currentOutputPacket.fields.forEach(field => {
      action[field.name] = this.mqttFieldsFormGroup.get(field.name).value;
    })
    const jActions = [JSON.stringify(action)];
    let jActionStr = JSON.stringify(jActions);
    console.log(jActionStr);
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
    this.currentOutputPacketId = packetId;
    this.getHPackets().then(packets => {
      let packet = packets.find(packet => packet.id === packetId)
      this.addOrUpdateFormControls(packet,data);
      this.originalValueUpdate();
      this.currentOutputPacket = packet;
    })
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
        if(data)
            this.mqttFieldsFormGroup.get(field.label).setValue(data[field.value]);
      })
      if(data)
        this.mqttFieldsFormGroup.get("active").setValue(data.active);
      this.mqttFieldsFormGroup.get("packet").setValue(packet.id);
      
    }
  }

  private originalValueUpdate() {
    this.originalFormsValues = this.getJsonForms();
  }

  private getJsonForms(): string {
    return JSON.stringify(this.mqttFieldsFormGroup.value);
  }

  private getHPackets() : Promise<HPacket[]> {
      if(this.allPackets)
        return new Promise((resolve,reject) => {
          resolve(this.allPackets);
        });
      else
        return new Promise((resolve,reject) => {
          this.hPacketsService.findAllHPacketByProjectIdAndType(this.currentProjectId,"OUTPUT,IO").toPromise().then(res => {
            this.allPackets = res;
            this.packetOptions = this.allPackets.map(p => ({ label: p.name, value: p.id }));
            resolve(this.allPackets);
          })
        });
  }
}