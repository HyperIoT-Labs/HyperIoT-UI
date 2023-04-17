import { Component, OnInit, Input, TemplateRef, ViewChild, ElementRef, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'hyt-stepper',
  templateUrl: './hyt-stepper.component.html',
  styleUrls: ['./hyt-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HytStepperComponent implements OnInit {
  /** ViewChild */
  @ViewChild('stepper') private stepperElement: ElementRef;

  /** Function called when click event is triggered */
  @Output() selectionChange: EventEmitter<any> = new EventEmitter();

  /** Variable used to display an alert icon if the field is Dirty */
  @Input() isDirty : boolean[];

  /** Enable liner stepper */
  @Input() isLinear = false;

  @Input() stepArray: TemplateRef<any>[];

  @Input() labelArray: string[];

  @Input() controlArray: FormGroup[];

  completed: string[];

  @Input()
  set completedArray(completedArr: string[]) {
    this.completed = completedArr;
  }

  /**
   * constructor
   * @param fb FormBuilder
   */
  constructor(private fb: FormBuilder) { }

  /**
   * ngOnInit
   */
  ngOnInit() {
  }

  /** Trigger next step */
  next() {
    const stepper = this.stepperElement as any;
    stepper.next();
  }

  change(event) {
    this.selectionChange.emit(event);
  }

  /** Trigger previous step */
  previous() {
    const stepper = this.stepperElement as any;
    stepper.previous();
  }

  changeStep(index: number) {
    const stepper = this.stepperElement as any;
    stepper.selectedIndex = index;
  }

}
