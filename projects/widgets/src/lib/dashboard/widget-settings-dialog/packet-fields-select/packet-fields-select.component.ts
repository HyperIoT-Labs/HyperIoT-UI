import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { SelectOption } from 'components';
import { HPacket, HPacketField } from 'core';

export interface PacketField extends HPacketField {
  packetId: number;
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

  @Input() fieldPacket: PacketField;
  @Output() fieldPacketChange: EventEmitter<PacketField> = new EventEmitter<PacketField>();

  selectedPacketId: number;
  selectedFieldName: string;

  hpacketsOptions: Array<SelectOption> = [];
  hpacketsFields: Array<PacketField> = [];
  hpacketsFieldsOptions: Array<SelectOption> = [];

  constructor(public settingsForm: NgForm) { }

  ngOnInit(): void {
    if (!this.projectId) {
      throw new Error('No projectId provided');
    }
    //TODO if it needs to be modified from outside then we must put it in onchange
    if (this.fieldPacket) {
      this.selectedPacketId = this.fieldPacket.packetId;
      this.selectedFieldName = this.fieldPacket.name;
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
    const selectedPacket = this.projectPackets.find((packet) => packet.id === this.selectedPacketId);
    this.hpacketsFields = selectedPacket.fields.map(field => (Object.assign(field, { packetId: selectedPacket.id })));
    this.hpacketsFieldsOptions = this.hpacketsFields.map((packetField) => ({
      value: packetField.name,
      label: packetField.name
    }));
  }

  onFieldChange() {
    if (!this.selectedFieldName) {
      return;
    }
    const selectedPacketField = this.hpacketsFields.find((field) => field.name === this.selectedFieldName);
    this.fieldPacketChange.emit(selectedPacketField);
  }
}
