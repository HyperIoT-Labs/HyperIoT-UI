import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: "[accordionContent]"
  })
  export class HytAccordionContent {
    constructor(public elementRef: ElementRef) {
      return elementRef.nativeElement;
    }
  }