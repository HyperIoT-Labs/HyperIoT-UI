import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[hytMapHost]',
})
export class MapDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
