import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { SelectOption } from 'components';
import { HPacket, HPacketField, HPacketFieldsHandlerService } from 'core';

export interface PacketField extends HPacketField {
  packetId: number;
  fieldSequence: any;
}

@Component({
  selector: 'hyperiot-packet-fields-select',
  templateUrl: './packet-fields-select.component.html',
  styleUrls: ['./packet-fields-select.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})

export class PacketFieldsSelectComponent implements OnInit {
  @Input() projectId: number;
  @Input() name: string;
  @Input() projectPackets: Array<HPacket> = [];
  @Input() isRequired: boolean = false;

  @Input() fieldPacket: PacketField;
  @Output() fieldPacketChange: EventEmitter<PacketField> = new EventEmitter<PacketField>();

  selectedFieldsOptions: number[] = [];

  selectedPacketId: number;
  selectedPacket: HPacket;
  // selectedFieldName: string;

  hpacketsOptions: Array<SelectOption> = [];
  hpacketsFields: Array<HPacketField> = [];
  // hpacketsFieldsOptions: Array<SelectOption> = [];

  constructor(
    public settingsForm: NgForm,
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService,
  ) { }

  ngOnInit(): void {
    if (!this.projectId) {
      throw new Error('No projectId provided');
    }
    //TODO if it needs to be modified from outside then we must put it in onchange
    if (this.fieldPacket) {
      this.selectedPacketId = this.fieldPacket.packetId;
      // this.selectedFieldName = this.fieldPacket.name;
    }
    if (this.projectPackets) {
      this.hpacketsOptions = this.projectPackets.map((packet) => ({
        value: packet.id,
        label: packet.name
      }));
      this.onPacketChange();
    };
  }

  onPacketChange() {
    if (!this.selectedPacketId) {
      return;
    }
    this.selectedFieldsOptions = [];
    this.selectedPacket = this.projectPackets.find((packet) => packet.id === this.selectedPacketId);
    if (this.fieldPacket && this.fieldPacket.packetId === this.selectedPacket.id) {
      this.selectedFieldsOptions = [this.fieldPacket.id];
    }
    // this.fieldPacketChange.emit(null);
    // this.hpacketsFieldsOptions = this.hpacketsFields.map((packetField) => ({
    //   value: packetField.name,
    //   label: packetField.name
    // }));
  }

  // onFieldChange() {
  //   if (!this.selectedFieldName) {
  //     return;
  //   }
  //   const selectedPacketField = this.hpacketsFields.find((field) => field.name === this.selectedFieldName);
  //   this.fieldPacketChange.emit(selectedPacketField);
  // }

  onPacketFieldChange(selected) {
    if(selected.length === 0) {
      this.fieldPacketChange.emit(null);
      return;
    }
    // const selectedPacket = this.projectPackets.find((packet) => packet.id === this.selectedPacketId);
    const selectedPacketField = this.hPacketFieldsHandlerService.findFieldFromPacketFieldsTree(this.selectedPacket, selected[0]);
    const fieldSequence = { };
    fieldSequence[selectedPacketField.id] = this.hPacketFieldsHandlerService.getStringifiedSequenceFromPacket(this.selectedPacket, selectedPacketField.id);
    this.fieldPacketChange.emit(Object.assign(
      selectedPacketField,
      {
        packetId: this.selectedPacketId,
        fieldSequence,
      }
    ));
  }
}
