/**
 * This class is used to configure packet id
 * and packet fields to receive from the
 * {@link DataStreamService}
 */
export class DataPacketFilter {
    packetId: number;
    fields: any; // TODO should use proper type
    // tell to data stream service if send whole packet (filtered on the basis of selected fields)
    // or send one field by one
    wholePacketMode: boolean;

    constructor(packetId: number, fields: any, wholePacketMode?: boolean) {
        this.packetId = packetId;
        this.fields = fields;
        this.wholePacketMode = wholePacketMode;
    }
}
