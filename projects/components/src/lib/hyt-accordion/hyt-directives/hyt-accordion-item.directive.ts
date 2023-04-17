import { Directive, Input, ContentChild } from '@angular/core';
import { HytAccordionContent } from './hyt-accordion-content.directive';

@Directive({
    selector: "hyt-accordion-item"
  })
  export class HytAccordionItem {
    @Input() header = "";
    @Input() disabled = false;
    
    @ContentChild(HytAccordionContent) content: HytAccordionContent;
  }