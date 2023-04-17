import { Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';

@Directive({
  selector: '[hytPageInput]'
})
export class PageInputDirective implements OnChanges {

  @Input() public hytPageInput: number;
  @Input() public pageValue: number;
  @Output() pageEvent: EventEmitter<number> = new EventEmitter<number>();

  private validationError = false;

  constructor(private el: ElementRef) { }

  validateInput() {
    if (/^-?\d+$/.test(this.el.nativeElement.value)) {
      this.validationError = false;
      this.el.nativeElement.style.backgroundColor = null;
      this.el.nativeElement.style.border = null;
    } else {
      this.validationError = true;
      this.el.nativeElement.style.backgroundColor = '#ff000040';
      this.el.nativeElement.style.border = '1px solid red';
    }
  }

  filterValue() {
    if (!this.validationError) {
      const pageNumber = this.el.nativeElement.value - 1;
      if (pageNumber < 0) {
        this.pageValue = 0;
      } else if (pageNumber > this.hytPageInput) {
        this.pageValue = this.hytPageInput;
      } else {
        this.pageValue = pageNumber;
      }
    }
    this.el.nativeElement.value = this.pageValue + 1;
    this.validateInput();
    this.pageEvent.emit(this.pageValue);
  }

  @HostListener('input', ['$event']) input(event) {
    this.validateInput();
  }

  @HostListener('keyup.enter', ['$event']) keyEnterUp(event) {
    this.filterValue();
  }

  ngOnChanges(): void {
    this.el.nativeElement.value = this.pageValue + 1;
    this.validateInput();
  }

}
