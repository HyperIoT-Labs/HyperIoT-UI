import { Injectable } from '@angular/core';

import { DataValue } from '../data/data-value';

import convert from 'convert-units';


/**
 * 
 */
@Injectable({
  providedIn: 'root'
})
export class UnitFormatterService {

  constructor() { }

  format(cfg, timestamp, field) {
    const fieldIds = Object.keys(cfg.packetFields);
    let newValue = "";
    let name = "";
    let unitSymbol = "";
    if (fieldIds.length > 0) {
      // cfg.packetFields[fieldIds[0]];
      name = cfg.packetFields[fieldIds[0]];
      const value = +field[name];
      let unitConversion;
      if (cfg.packetUnitsConversion) {
        unitConversion = cfg.packetUnitsConversion.find((uc) => uc.field.id == fieldIds[0]);
        if (unitConversion) {
          if (unitConversion.convertFrom !== unitConversion.convertTo) {
            newValue = convert(+value)
              .from(unitConversion.convertFrom)
              .to(unitConversion.convertTo);
            unitSymbol = unitConversion.convertTo;
          } else {
            if (unitConversion.convertFrom == null && unitConversion.conversionCustomLabel && unitConversion.conversionCustomLabel.length > 0) {
              unitSymbol = unitConversion.conversionCustomLabel;
            } else if (unitConversion.convertFrom != null) {
              unitSymbol = unitConversion.convertFrom;
            }
            newValue = value.toString();
          }
        }
      }

      if (!unitConversion) {
        // round to 2 decimal digits if no unit conversion is configured
        newValue = (+value).toFixed(2);
      } else if (!isNaN(unitConversion.decimals)) {
        // round to configured decimal digits
        newValue = (+newValue).toFixed(unitConversion.decimals);
      }
    }
    return new DataValue(newValue, name, unitSymbol);
  }

}
