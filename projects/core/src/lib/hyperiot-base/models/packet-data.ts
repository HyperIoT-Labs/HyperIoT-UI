export type PacketData  = {
    [key: string]: any;
    timestamp?: Date;
}

export type PacketDataChunk = {
    packetId: number;
    data: PacketData[];
}