import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { PacketData } from '../../hyperiot-base/models/packet-data';

export class WsDataSenderService {

  private baseWs = (location.protocol == 'https:') ? 'wss:' : 'ws:';
  private wsUrl = this.baseWs + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/hyperiot/ws/mqtt';
  private wsSubject: WebSocketSubject<any>;

  connect(deviceName: string, password: string, topic: string): WebSocketSubject<any> {

    this.disconnect();

    this.wsSubject = webSocket({
      url: this.wsUrl +
        '?hyperiot-mqtt-username=' + deviceName +
        '&hyperiot-mqtt-password=' + password +
        '&hyperiot-mqtt-topic=' + topic,
      deserializer: e => e.data,
    });

    return this.wsSubject;

  }

  disconnect() {
    if (this.wsSubject) {
      this.wsSubject.complete();
    }
  }

  send(data: PacketData) {

    if (!this.wsSubject) {
      throw 'Unavailable web socket connection';
    }

    this.wsSubject.next(data);

  }

}
