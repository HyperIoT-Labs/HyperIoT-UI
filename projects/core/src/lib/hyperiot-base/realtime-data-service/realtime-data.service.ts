import { Injectable } from '@angular/core';
import { Subject,Observable } from 'rxjs';
import { BaseDataService } from '../base-data.service';
import { DataChannel } from '../models/data-channel';
import { DataPacketFilter } from '../models/data-packet-filter';
import { IDataService } from '../data.interface';
import { RealtimeDataChannelController } from './realtimeDataChannelController';
import { PacketData, PacketDataChunk } from '../models/packet-data';
import { HPacket } from '../../hyperiot-client/models/hPacket';

@Injectable({
  providedIn: 'root'
})
/**
 * A service for connecting to HyperIoT events stream
 * via WebSocket.
 */
export class RealtimeDataService extends BaseDataService implements IDataService {

  /**
   * List of data channels requested by widgets.
   * Once connected to the main data stream (via websocket)
   * this service will deliver incoming data to the widgets
   * based on data filters specified in the StreamSubscription.
   */
  dataChannels: { [id: string]: DataChannel; } = {};
  /**
   * Connection status
   */
  isConnected: boolean;
  eventStream: Subject<any>;


  private baseWs = (location.protocol == 'https:') ? 'wss:' : 'ws:';
  private timer;
  private wsUrl = this.baseWs + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/hyperiot/ws/project?projectId=';
  private ws: WebSocket;

  pingMessage = {
    cmd: null,
    type: 'PING',
    payload: ''
  };
  packetSchema: any;

  constructor() {
    super();
    this.eventStream = new Subject<any>();
  }

  /**
   * Opens the WebSocket session for data streaming.
   *
   * @param url WebSocket endpoint url
   */
  connect(projectId: number, url?: string) {
    console.log('Connecting websocket...');
    this.disconnect();
    this.ws = new WebSocket(url != null ? url : this.wsUrl + projectId);
    this.ws.onmessage = this.onWsMessage.bind(this);
    this.ws.onerror = this.onWsError.bind(this);
    this.ws.onclose = this.onWsClose.bind(this);
    this.ws.onopen = this.onWsOpen.bind(this);
    this.keepAlive();
  }


  keepAlive() {
    this.timer = setTimeout(() => {
      if (this.ws != null && this.ws.readyState == this.ws.OPEN) {
        console.log('Sending heartbeat to websocket...');
        this.ws.send(JSON.stringify(this.pingMessage));
      }
      this.keepAlive();
    }, 40000);
  }

  cancelKeepAlive() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Closes the WebSocket session.
   */
  disconnect() {
    if (this.ws != null) {
      this.ws.close();
      this.ws = null;
    }
    this.cancelKeepAlive();
    this.isConnected = false;
  }

  /**
   * Adds a new data channel that can be used for subscribing to data streaming events.
   *
   * @param widgetId The widget identifier.
   * @param dataPacketFilter Data packet filter which defines the packet id and packet fields to receive.
   */
   addDataChannel(widgetId: number, dataPacketFilterList: DataPacketFilter[]): DataChannel {
    // TODO improve following code
    if (this.dataChannels[widgetId]) {
      return super.addDataChannel(widgetId, dataPacketFilterList);
    }

    const dataChannel = super.addDataChannel(widgetId, dataPacketFilterList);
    dataChannel.controller = new RealtimeDataChannelController();
    (dataChannel.controller.dataStreamOutput$ as Observable<PacketDataChunk>).subscribe(dataChannel.subject);
    return dataChannel;
  }

  private onWsOpen() {
    this.isConnected = true;
  }
  private onWsClose() {
    this.isConnected = false;
  }
  private onWsError() {
    // TODO: report error
  }
  private onWsMessage(event: MessageEvent) {
    // avsc.js must be manually included in the hosting page
    const avro = window['avsc'];
    if (!avro) {
      const errorMessage = '@hyperiot/core/data-stream-service - ERROR: https://github.com/aszmyd/avsc-js (dist) must be included in the hosting page.';
      console.error(errorMessage);
      throw Error(errorMessage);
    }
    // read AVRO-serialized HPacket from Kafka-Flux
    const wsData = JSON.parse(event.data);
    // decode base-64 payload
    const decodedWsPayload = atob(wsData.payload);
    // TODO: add specific type 'SCHEMA' instead of using 'INFO'
    if (wsData.type === 'INFO') {
      this.packetSchema = avro.parse(JSON.parse(decodedWsPayload));
      return;
    } else if (!this.packetSchema) {
      // cannot continue without schema definition
      return;
    }
    // decode AVRO data to HPacket instance
    const hpacket = this.packetSchema.decode(new Buffer(decodedWsPayload, 'binary')) as HPacket;
    // route received HPacket to eventStream subscribers
    this.eventStream.next({ data: hpacket });
    if (wsData.type === 'APPLICATION') {
      // extract and route subscribed fields to data channels
      for (const id in this.dataChannels) {
        if (this.dataChannels.hasOwnProperty(id)) {
          const channelData: DataChannel = this.dataChannels[id];
          // check if message is valid for the current
          // channel, if so emit a new event
          channelData.packetFilterList
            .filter(packetFilter => packetFilter.packetId === hpacket.id)
            .forEach(packetFilter => {
              let fields: PacketData = {};
              if(packetFilter.wholePacketMode) {
                // emitted event is going to contain all filtered fields
                Object.keys(packetFilter.fields).forEach(fieldId => {
                  const field = this.getField(packetFilter, hpacket, fieldId)
                  if (Object.keys(field).length > 0)
                    Object.assign(fields, field);
                });
                fields.timestamp = this.getTimestamp(hpacket);
              }
              else {
                // emitted event is going to contain one field
                Object.keys(packetFilter.fields).forEach((fieldId: any) => {
                  const field = this.getField(packetFilter, hpacket, fieldId);
                  if (Object.keys(field).length > 0) {
                    Object.assign(fields, field);
                  }
                });
              }
              const packetDataChunk: PacketDataChunk = {
                packetId: packetFilter.packetId,
                data: [fields]
              };
              (channelData.controller as RealtimeDataChannelController).dataStreamInput$.next(packetDataChunk);
            });
          
        }
      }
    } else if (wsData.type === 'ERROR') {
      console.error('Error on websocket:', hpacket);
    } else {
      console.error('Invalid packet type:', wsData.type);
    }
  }

  private getField(packetFilter: DataPacketFilter, hpacket: HPacket, fieldId: any): Object {
    let field = {};
    const fieldName = packetFilter.fields[fieldId];
    if (hpacket.fields.map.hasOwnProperty(fieldName)) {
      const tmpValue = hpacket.fields.map[fieldName].value;
      // based on the type, the input packet field value
      // will be stored in the corresponding type property
      // eg. if packet field is "DOUBLE" then the effective value
      // will be stored into 'value.double' property
      if (!tmpValue) {
        field[fieldName] = null;
      } else {
        const valueKey = Object.keys(tmpValue)[0];
        const value = hpacket.fields.map[fieldName].value[valueKey];
        field[fieldName] = value;
      }
    }
    return field;
  }

  private getTimestamp(hpacket: HPacket): Date {
    // get timestamp from packet if present
    let timestampFieldName = hpacket.timestampField;
    if (hpacket.fields.map[timestampFieldName])
      return new Date(hpacket.fields.map[timestampFieldName].value.long);
    return new Date();
  }

  playStream() {

  }

  pauseStream() {
    
  }

}
