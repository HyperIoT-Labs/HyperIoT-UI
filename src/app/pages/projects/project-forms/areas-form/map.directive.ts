import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[hytMapHost]',
    standalone: false
})
export class MapDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
