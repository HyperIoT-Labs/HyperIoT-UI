import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: "[accordionHeader]"
})
export class HytAccordionHeader {
  constructor(public templateRef: TemplateRef<any>) {}
}