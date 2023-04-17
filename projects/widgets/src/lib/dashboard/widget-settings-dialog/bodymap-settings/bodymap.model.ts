import { HPacket } from 'core';

export interface BodyMap {
  label: string;
  value: string;
  svg: string;
  dataUrl: string;
}

export interface BodyMapAssociation {
  muscleIds: string[];
  packets: HPacket[];
  color: string;
}
