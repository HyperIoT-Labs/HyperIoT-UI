export enum ServiceType {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    DEV = 'DEV',
}
export type TypeModelService = ServiceType.OFFLINE | ServiceType.ONLINE | ServiceType.DEV;
