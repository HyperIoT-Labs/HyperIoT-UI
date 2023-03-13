import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Logger, LoggerService } from '@hyperiot/core';
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

  @Input()
  summaryList: SummaryList;

  @Input()
  addButtonActive = false;

  @Input()
  currentDevice = null;

  @Input()
  enrichmentPacketId = null;

  filteredElementList: SummaryListItem[] = [];

  /**
   * logger service
   */
  private logger: Logger;

  constructor(private loggerService: LoggerService) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('GenericSummaryListComponent');
}

  ngOnInit() {
    this.filterElements(this.summaryList, this.currentDevice,this.enrichmentPacketId);
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentDevice = this.getCurrentElementByField(changes, 'currentDevice');
    const currentSummaryList = this.getCurrentElementByField(changes, 'summaryList');
    const currentPacketID = this.getCurrentElementByField(changes, 'enrichmentPacketId');
    this.filterElements(currentSummaryList, currentDevice, currentSummaryList.title == 'Packet Enrichments' && currentPacketID);
  }

  /**
   * Fn called onInit and onChange where based on the packet name it filters the elements
   * @param list 
   * @param device 
   * @param packetId optional
   */
  filterElements(list: SummaryList, device: any, packetId?: number) {
    this.logger.debug('filterElements: list', list);
    switch (list.title) {
      case 'Packets':
        this.getFilteredElement(list.list, device, false);
        break;
      case 'Packet Events':
        this.getFilteredElement(this.summaryList.list, device, false,-1, true);
        break;
      case 'Packet Enrichments':
        this.getFilteredElement(this.summaryList.list, device, true, packetId);
        break;
    }
  }

  /**
   * Takes in the current context and field and filters the corrected value
   * @param changes current summary list
   * @param field 
   * @returns the current element or the field
   */
  getCurrentElementByField(changes: SimpleChanges, field: string) {
    return (changes[field] && (changes[field]?.currentValue !== changes[field]?.previousValue)) ?
      changes[field]?.currentValue : this[field];
  }

  /**
   * Generic function called for the actions available in the component
   * @param action possible values: 'add' | 'edit' | 'duplicate' | 'delete'
   * @param itemT (optional)
   */
  onOptionClick(action: any, itemT?: SummaryListItem) {
    itemT ? 
    this.menuAction.emit({
      action: action,
      item: itemT
    })
    : this.menuAction.emit({
      action: action
    });
  }

  getFilteredElement(itemList: SummaryListItem[], deviceToFilter: string, isEnrichment: boolean = false, packetIDToFilter?: number, isEvent: boolean = false){
    this.filteredElementList = [];
    itemList.forEach((singleItem) => {
      if (isEnrichment) {
        if(singleItem.data.packet.id === packetIDToFilter && singleItem.data.packet.device.deviceName === deviceToFilter) {
          this.filteredElementList.push(singleItem);
        }
      } else if (isEvent) {
        if (singleItem.data.type === 'EVENT') {
          this.filteredElementList.push(singleItem);
        }
      } else {
        if(singleItem.data.device.deviceName === deviceToFilter) {
          this.filteredElementList.push(singleItem);
        }
      }
    });
  }
}
