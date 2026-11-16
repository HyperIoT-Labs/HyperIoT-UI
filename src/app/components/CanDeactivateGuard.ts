
import { Injectable } from '@angular/core';

@Injectable()
export class CanDeactivateGuard  {
    canDeactivate(component: any) {
        return component.canDeactivate ? component.canDeactivate() : true;
    }
}
