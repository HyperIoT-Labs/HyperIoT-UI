import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<any> {
    canDeactivate(component: any) {
        return component.canDeactivate ? component.canDeactivate() : true;
    }
}
