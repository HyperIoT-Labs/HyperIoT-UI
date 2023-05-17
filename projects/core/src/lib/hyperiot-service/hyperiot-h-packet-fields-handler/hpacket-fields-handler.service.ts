import { Injectable } from '@angular/core';
import { HPacket } from '../../hyperiot-client/models/hPacket';
import { HPacketField } from '../../hyperiot-client/models/hPacketField';

interface FieldList {
  field: HPacketField;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class HPacketFieldsHandlerService {

  readonly FIELD_SEPARATOR = ' -> ';

  constructor() { }

  flatFieldsTree(fieldArr: HPacketField[], pre?: string): FieldList[] {
    let flatFieldsList: FieldList[] = [];
    fieldArr.forEach(f => {
      // const fieldName: string = pre ? pre + this.FIELD_SEPARATOR + f.name : f.name;
      const fieldName = f.name;
      if (f.innerFields && f.innerFields.length) {
        flatFieldsList = flatFieldsList.concat(this.flatFieldsTree(f.innerFields, fieldName));
      } else {
        flatFieldsList.push({ field: f, label: fieldName });
      }
    });
    return flatFieldsList;
  }

  flatPacketFieldsTree(hPacket: HPacket): FieldList[] {
    return this.flatFieldsTree(hPacket.fields);
  }

  findFieldFromFieldsTree(fields: HPacketField[], fieldId: number): HPacketField {
    if (fields.some(field => field.id === fieldId)) {
      return fields.find(field => field.id === fieldId);
    }
    for (const field of fields) {
      if (field.innerFields && field.innerFields.length) {
        const resultField = this.findFieldFromFieldsTree(field.innerFields, fieldId);
        if (resultField) {
          return resultField;
        }
      }
    }
    return null;
  }

  findFieldFromPacketFieldsTree(hPacket: HPacket, fieldId: number): HPacketField {
    return this.findFieldFromFieldsTree(hPacket.fields, fieldId);
  }

  getFieldSequence(fields: HPacketField[], packetFieldId: number): string[] {
    for (const field of fields) {
      if (field.id === packetFieldId) {
        return [field.name];
      }
      else if (field.innerFields && field.innerFields.length > 0) {
        const subSequence = this.getFieldSequence(field.innerFields, packetFieldId);
        if (subSequence && subSequence.length > 0) {
          subSequence.unshift(field.name);
          return subSequence;
        }
      }
    }
    return [];
  }

  getFieldSequenceFromPacket(hPacket: HPacket, packetFieldId: number): string[] {
    return this.getFieldSequence(hPacket.fields, packetFieldId);
  }

  getStringifiedSequenceFromPacket(hPacket: HPacket, packetFieldId: number): string {
    return this.getFieldSequenceFromPacket(hPacket, packetFieldId).join('.');
  }

  // getHPacketFieldId(fields: HPacketField[], sequence: string[]): number {
  //   let field;
  //   sequence.forEach(key => {
  //     if (fields.some(field => field.name === key)) {
  //       field = fields.find(field => field.name === key);
  //       fields = field.innerFields;
  //     } else {
  //       return null;
  //     }
  //   });
  //   return field.id;
  // }

  // getHPacketFieldIdFromPacket(hPacket: HPacket, sequence: string[]): number {
  //   return this.getHPacketFieldId(hPacket.fields, sequence);
  // }

}
