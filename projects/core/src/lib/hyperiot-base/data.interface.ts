import { BehaviorSubject } from 'rxjs';
import { DataChannel } from './models/data-channel';
import { DataPacketFilter } from './models/data-packet-filter';

export interface IDataService {

    addDataChannel(widgetId: number, dataPacketFilterList: DataPacketFilter[]): DataChannel;
    copyDataChannel(widgetId: number, originalChannelId: number);
    removeDataChannel(widgetId: number): void;
    loadNextData?(channelId: number): void;
    loadAllRangeData?(channelId: number): void;
    rangeSelectionDataAlreadyLoaded?: BehaviorSubject<boolean>;
    
}
