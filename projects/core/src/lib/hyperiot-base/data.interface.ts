import { DataChannel } from './models/data-channel';
import { DataPacketFilter } from './models/data-packet-filter';

export interface IDataService {

    addDataChannel(widgetId: number, dataPacketFilterList: DataPacketFilter[]): DataChannel;
    removeDataChannel(widgetId: number): void;
    loadNextData?(channelId: number): void;
    
}
