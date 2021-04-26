import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { HPacket, HpacketsService } from '@hyperiot/core';
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
  packetOptions: SelectOption[] = [];
  packetsPromise: Promise<HPacket[]>;

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
      packet:this.mqttFieldsFormGroup.get("packet").value
    };
    this.currentOutputPacket.fields.forEach(field => {
      action[field.name] = this.mqttFieldsFormGroup.get(field.name).value;
    })
    const jActions = [JSON.stringify(action)];
    let jActionStr = JSON.stringify(jActions);
    console.log(jActionStr);
    return jActionStr;
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

  private addOrUpdateFormControls(packet:HPacket,data?){
    if(packet){
      packet.fields.forEach(field => {
        if(!this.mqttFieldsFormGroup.get(field.name)){
          this.mqttFieldsFormGroup.addControl(field.name,new FormControl());
        }
        if(data)
            this.mqttFieldsFormGroup.get(field.name).setValue(data[field.name]);
      })
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
