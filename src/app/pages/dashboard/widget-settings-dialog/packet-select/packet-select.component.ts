import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';

import { HPacket, HPacketField, HpacketsService } from '@hyperiot/core';

export class FieldMatrixConfiguration {
  field: HPacketField;
  map: FieldMatrixMapItem[];
}
export class FieldMatrixMapItem {
  coords: string;
  name: string;
  index: number;
}

@Component({
  selector: 'hyt-packet-select',
  templateUrl: './packet-select.component.html',
  styleUrls: ['./packet-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class PacketSelectComponent implements OnInit {
  @Input() widget;
  @Input()
  selectedPacket: HPacket = null;
  @Input()
  selectedFields: any = [];
  @Output()
  selectedFieldsChange = new EventEmitter();
  projectPackets: HPacket[] = [];
  @Input()
  multiPacketSelect: false;

  packetFieldsMapping: FieldMatrixConfiguration[];

  constructor(private packetService: HpacketsService, public settingsForm: NgForm) {
    this.multiPacketSelect = this.multiPacketSelect || false;
  }

  ngOnInit() {
    this.loadPackets();
  }

  onPacketChange() {
    this.selectedFields = [];
    this.selectedFieldsChange.emit(this.selectedFields);
  }

  onPacketFieldChange($event) {
    if (this.multiPacketSelect) {
      // multiple select
      const nullIndex = this.selectedFields.indexOf(null);
      if (nullIndex >= 0) {
        delete this.selectedFields[nullIndex];
      }
      // fields mapping for current packet field
      this.syncFieldMapping();
    } else {
      // single select
      this.selectedFields = $event;
    }
    this.selectedFieldsChange.emit(this.selectedFields);
  }

  onAddFieldMapping(fieldMatrix: FieldMatrixConfiguration) {
    fieldMatrix.map.push(new FieldMatrixMapItem());
  }
  onDeleteFieldMapping(fieldMatrix: FieldMatrixConfiguration, mapIndex: number) {
    fieldMatrix.map.splice(mapIndex, 1);
  }
  onFieldMappingChange(fieldMap: FieldMatrixMapItem, value: string) {
    fieldMap.name = value;
  }

  apply() {
    if (this.selectedPacket) {
      this.widget.config.packetId = this.selectedPacket.id;
      this.widget.config.packetFields = {};
      if (!this.multiPacketSelect) {
        this.selectedFields = [ this.selectedFields ];
      }
      this.selectedFields.map((pf) => this.widget.config.packetFields[pf.id] = pf.name);
      this.widget.config.packetFieldsMapping = this.packetFieldsMapping;
      console.log(this.widget);
    }
  }

  packetCompare(p1: HPacket, p2: HPacket) {
    return p1 != null && p2 != null && p1.id === p2.id;
  }

  loadPackets() {
    this.packetFieldsMapping = this.widget.config.packetFieldsMapping ?
        JSON.parse(JSON.stringify(this.widget.config.packetFieldsMapping)) : [];
    // fetch all packets
    this.packetService
      .findAllHPacketByProjectId(this.widget.projectId)
      .subscribe((packetList) => {
        this.projectPackets = packetList;
        const w = this.widget;
        // load curent packet data and set selected fields
        if (w.config && w.config.packetId) {
          this.packetService.findHPacket(w.config.packetId)
            .subscribe((packet: HPacket) => {
              this.selectedPacket = packet;
              if (this.widget.config.packetFields) {
                packet.fields.map((pf) => {
                  if (this.widget.config.packetFields[pf.id]) {
                    if (this.multiPacketSelect) {
                      this.selectedFields.push(pf);
                    } else {
                      this.selectedFields = pf;
                    }
                  }
                });
              }
            });
        }
      });
  }

  private syncFieldMapping() {
    if (!this.packetFieldsMapping) {
      this.packetFieldsMapping = [];
    }
    const tempMap = [] as FieldMatrixConfiguration[];
    this.selectedFields.map((pf: HPacketField) => {
      if (pf.multiplicity === HPacketField.MultiplicityEnum.ARRAY || pf.multiplicity === HPacketField.MultiplicityEnum.MATRIX) {
        const fieldMapping = this.packetFieldsMapping.find((f) => f.field.id === pf.id);
        if (!fieldMapping) {
          const af = new FieldMatrixConfiguration();
          af.field = pf;
          af.map = [] as FieldMatrixMapItem[];
          tempMap.push(af);
        } else {
          tempMap.push(fieldMapping);
        }
      }
    });
    this.packetFieldsMapping = tempMap;
  }

}
