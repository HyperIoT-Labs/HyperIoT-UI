import { GridsterItem } from 'angular-gridster2';
import { BodyMap, BodyMapAssociation } from '../../../dashboard/widget-settings-dialog/bodymap-settings/bodymap.model';

export interface WidgetConfig extends GridsterItem {
    projectId?: number;
    name?: string;
    type?: string;
    dataUrl?: string;
    dataTableUrl?: string;
    packetId?: number;
    config?: ConfigModel;
}

export interface InternalConfigModel {
  [key: string]: any;
}

export interface ConfigModel {
    internalConfig?: InternalConfigModel;
    svgImage?: string;
    packetId?: number; // TODO più pacchetti???
    packetFields?: string[];  // TODO FIX usare tipo corretto
    fieldAliases?: string[];  // TODO FIX usare tipo corretto
    fieldTypes?: any;
    fieldFileMimeTypes?: any;
    timeAxisRange?: number;
    maxDataPoints?: number;
    timeWindow?: number;
    seriesConfig?: SeriesConfigModel[];
    timestampFieldName?: string;
    packetUnitsConversion?: any;
    packetFieldsMapping?: any[];
    maxLogLines?: number;
    refreshIntervalMillis?: number;
    musclesMap?: BodyMapAssociation[]; // TODO separare da generic ConfigModel
    bodyMap?: BodyMap; // TODO separare da generic ConfigModel
    hProjectAlgorithmId?: any; // TODO separare da generic ConfigModel
    outputFields?: any; // TODO separare da generic ConfigModel
    colors?: any; // the key is the field and the value is the selected color
    textColor?: string; // TODO separare da generic ConfigModel
    bgColor?: 'dark' | 'bright';
    defibrillator?: any;
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
