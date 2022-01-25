import { eventNames } from 'process';
import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, OnChanges, SimpleChanges } from '@angular/core';

export class SummaryList {
  title: string;
  list: SummaryListItem[];
}
export class SummaryListItem {
  index = 0;
  name: string;
  description: string;
  data: any;
}

@Component({
  selector: 'hyt-generic-summary-list',
  templateUrl: './generic-summary-list.component.html',
  styleUrls: ['./generic-summary-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GenericSummaryListComponent implements OnInit, OnChanges {

  @Output() menuAction = new EventEmitter<{
    action: 'add' | 'edit' | 'duplicate' | 'delete',
    item?: any
  }>();

  _summaryList: SummaryList;
  @Input()
  set summaryList(summary: SummaryList) {
    this._summaryList = summary;
  }

  @Input()
  addButtonActive = false;

  @Input()
  currentDevice = null;

  @Input()
  enrichmentPacketId = null;

  selectedItem: SummaryListItem;

  filteredElementList: SummaryListItem[] = [];

  constructor() {
  }

  ngOnInit() {
    
    switch (this._summaryList.title) {
      case 'Packets':
        
        this.getFilteredElement(this._summaryList.list, this.currentDevice, false);
        break;

      case 'Packet Enrichments':
        
        this.getFilteredElement(this._summaryList.list, this.currentDevice, true, this.enrichmentPacketId);
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    switch (this._summaryList.title) {

      case 'Packets':
        
        const pDeviceName = (changes['currentDevice'] && changes['currentDevice']?.currentValue !== changes['currentDevice']?.previousValue) ?
          changes['currentDevice']?.currentValue : this.currentDevice;

        const pSummaryList = (changes['summaryList'] && changes['summaryList']?.currentValue !== changes['summaryList']?.previousValue) ?
        changes['summaryList']?.currentValue : this._summaryList;

        this.getFilteredElement(pSummaryList.list, pDeviceName, false );

        break;

      case 'Packet Enrichments':
        
        const peDeviceName = (changes['currentDevice'] && (changes['currentDevice']?.currentValue !== changes['currentDevice']?.previousValue)) ?
          changes['currentDevice']?.currentValue : this.currentDevice;

        const pePacketID = (changes['enrichmentPacketId'] && (changes['enrichmentPacketId']?.currentValue !== changes['enrichmentPacketId']?.previousValue)) ?
          changes['enrichmentPacketId']?.currentValue : this.enrichmentPacketId;

          this.getFilteredElement(this._summaryList.list, peDeviceName, true, pePacketID);

        break;
    }
  }

  addEntity() {
    this.menuAction.emit({
      action: 'add'
    });
  }

  onEditOptionClick(itemT: SummaryListItem) {
    this.menuAction.emit({
      action: 'edit',
      item: itemT
    });
  }

  onDuplicateOptionClick(itemT: SummaryListItem) {
    this.menuAction.emit({
      action: 'duplicate',
      item: itemT
    });
  }

  onDeleteOptionClick(itemT: SummaryListItem) {
    this.menuAction.emit({
      action: 'delete',
      item: itemT
    });
  }

  getFilteredElement(itemList: SummaryListItem[], deviceToFilter: string, isEnrichment: boolean = false, packetIDToFilter?: number){
    
    this.filteredElementList = [];

    if(isEnrichment) {
      
      itemList.map((singleItem) => {

        if(singleItem.data.packet.id === packetIDToFilter && singleItem.data.packet.device.deviceName === deviceToFilter) {
          this.filteredElementList.push(singleItem);
        }

      });

    } else {
      
      itemList.map((singleItem) => {
        
        if(singleItem.data.device.deviceName === deviceToFilter) {
          this.filteredElementList.push(singleItem);
        }

      });

    }

  }

}
