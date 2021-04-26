import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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

  constructor(private hPacketsService: HpacketsService,private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadHPackets();
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
      let keys = Object.keys(data);
      this.packetChanged(data["packet"]);
      keys.forEach(key => {
        if(this.mqttFieldsFormGroup.get(key)){
          console.log("adding key: ",key,data[key])
          this.mqttFieldsFormGroup.get(key).setValue(data[key]);
        }
      });
      this.originalValueUpdate();
      console.log(this.mqttFieldsFormGroup);
      this.cd.detectChanges();
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

  packetChanged(packetId){
    this.currentOutputPacketId = packetId;
    if(!this.allPackets)
      this.loadHPackets(this.reloadSelectedPacketInformation);
    else
      this.reloadSelectedPacketInformation(this)
  }

  inputChanged(target,fieldName){
    this.mqttFieldsFormGroup.get(fieldName).setValue(target.value);
    console.log(this.mqttFieldsFormGroup);
  }

  private reloadSelectedPacketInformation(self){
    let packet = self.allPackets.find(packet => packet.id === self.currentOutputPacketId);
    self.addOrUpdateFormControls(packet);
    self.currentOutputPacket = packet;
  }

  private addOrUpdateFormControls(packet:HPacket){
    if(packet){
      packet.fields.forEach(field => {
        if(!this.mqttFieldsFormGroup.get(field.name)){
          this.mqttFieldsFormGroup.addControl(field.name,new FormControl());
        }
      })
    }
  }

  private originalValueUpdate() {
    this.originalFormsValues = this.getJsonForms();
  }

  private getJsonForms(): string {
    return JSON.stringify(this.mqttFieldsFormGroup.value);
  }

  private loadHPackets(callback?) {
      let self = this;
      this.hPacketsService.findAllHPacketByProjectIdAndType(this.currentProjectId,"OUTPUT,IO").subscribe(
        (res: HPacket[]) => {
          this.allPackets = res;
          this.packetOptions = this.allPackets.map(p => ({ label: p.name, value: p.id }));
          if(callback)
            callback(self);
        }
      );
  }
}
