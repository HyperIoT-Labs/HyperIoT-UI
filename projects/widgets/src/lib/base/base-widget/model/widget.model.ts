import { GridsterItem } from 'angular-gridster2';
import { BodyMap, BodyMapAssociation } from '../../../dashboard/widget-settings-dialog/bodymap-settings/bodymap.model';
import { DefibrillatorSettings } from '../../../dashboard/widget-settings-dialog/defibrillator-settings/defibrillator-settings.model';
import { HPacketField } from 'core';
import { DataSimulatorSettings } from '../../../dashboard/widget-settings-dialog/data-simulator-settings/data-simulator.models';

export interface WidgetConfig extends GridsterItem {
    projectId?: number;
    name?: string;
    type?: string;
    dataUrl?: string;
    dataTableUrl?: string;
    packetId?: number;
    config?: ConfigModel;
    resizeCallback?: (gridsterItem, gridsterItemComponent) => void;
}

export interface InternalConfigModel {
  [key: string]: any;
}

export interface ConfigModel {
    internalConfig?: InternalConfigModel;
    svgImage?: string;
    packetId?: number; // TODO più pacchetti???
    packetFields?: string[];  // TODO FIX use proper type (correct type should be { [fieldId: number]: string; })
    fieldAliases?: FieldAliases;
    fieldTypes?: FieldTypes;
    fieldFileMimeTypes?: FieldFileMimeTypes;
    fieldUnitConversions?: FieldUnitConversion;
    timeAxisRange?: number;
    maxDataPoints?: number;
    timeWindow?: number;
    seriesConfig?: SeriesConfigModel[];
    timestampFieldName?: string;
    packetUnitsConversion?: any;
    maxLogLines?: number;
    refreshIntervalMillis?: number;
    musclesMap?: BodyMapAssociation[]; // TODO separare da generic ConfigModel
    bodyMap?: BodyMap; // TODO separare da generic ConfigModel
    hProjectAlgorithmId?: any; // TODO separare da generic ConfigModel
    outputFields?: any; // TODO separare da generic ConfigModel
    colors?: any; // the key is the field and the value is the selected color
    textColor?: string; // TODO separare da generic ConfigModel
    bgColor?: 'dark' | 'bright';
    defibrillator?: DefibrillatorSettings.DefibrillatorSettings;
    dataSimulatorSettings?: DataSimulatorSettings.DataSimulatorSettings;
    fieldValuesMap?: FieldValuesMap;
}

export interface FieldUnitConversion {
    [fieldId: number]: {
        convertFrom: string;
        convertTo: string;
        decimals: number;
        options: any[];
        conversionCustomLabel: string;
    };
}

export class FieldAliases {
    [fieldId: number]: string;
}
  
export class FieldFileMimeTypes {
    [fieldId: number]: string;
}

export class FieldTypes {
    [fieldId: number]: HPacketField.TypeEnum;
}

export class FieldValuesMapList {
    [fieldId: number]: FieldValuesMap[];
}

export class FieldValuesMap {
    value: any;
    output: {
        mappedValue: string;
        color?: string;
        bgcolor?: string;
        icon?: string;
    }
}

export interface SeriesConfigModel {
    series?: string;
    seriesConfig?: {
      [n: string]: {series: string};
    };
    config?: {
        fill?: string;
        line?: {
            shape?: string;
        }
    };
    layout?: {
        title?: {
            font?: {
                size?: number;
                color?: string;
            },
            xref?: string;
            yref?: string;
            x?: number;
            y?: number;
            pad?: {
                t?: number;
                l?: number
            };
            text?: string;
        };
    };
}

export interface WidgetAction{
    widget: WidgetConfig;
    action: string;
    value?: any;
  }

export enum AutoUpdateConfigStatus {
    UNNECESSARY = 'UNNECESSARY',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}
