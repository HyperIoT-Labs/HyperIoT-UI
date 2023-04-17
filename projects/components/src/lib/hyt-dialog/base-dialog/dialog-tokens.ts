import { ComponentType } from '@angular/cdk/portal';
import { InjectionToken } from '@angular/core';
import { DialogRef } from './dialog-ref';
import { DialogConfig } from './model/dialog-model';

export const DIALOG_DATA_TOKEN = new InjectionToken<DialogConfig>('dialog-data');
export const DIALOG_OVERLAY_COMPONENT_REF_TOKEN = new InjectionToken<DialogRef<any>>('overlay-component-ref');
export const DIALOG_COMPONENT = new InjectionToken<ComponentType<any>>('dialog-component');
export const DIALOG_COMPONENT_DATA = new InjectionToken<any>('dialog-component-data');