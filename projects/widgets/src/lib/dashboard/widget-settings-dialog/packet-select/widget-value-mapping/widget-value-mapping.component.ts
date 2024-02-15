import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { HPacketField } from 'core';
import { FieldValuesMap } from '../../../../base/base-widget/model/widget.model';

@Component({
  selector: 'hyperiot-widget-value-mapping',
  templateUrl: './widget-value-mapping.component.html',
  styleUrls: ['./widget-value-mapping.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WidgetValueMappingComponent),
      multi: true,
    }
  ],
})
export class WidgetValueMappingComponent implements ControlValueAccessor, OnInit {
  
  @Input() field: HPacketField;

  value: FieldValuesMap[] = [];

  valuesMapForm = new FormGroup({
    valuesMap: new FormArray([]),
  });

  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit(): void {
    this.valuesMapForm.valueChanges.subscribe(res => {
      this.value = res.valuesMap;
      this.onChange(this.value);
    });
  }

  writeValue(value: FieldValuesMap[]): void {
    if (!value) {
      value = [];
    }
    this.valuesMapFormArray.clear();
    value.forEach(valueMap => {
      this.valuesMapFormArray.push(new FormGroup({
        value: new FormControl(valueMap.value, [Validators.required]),
        output: new FormGroup({
          mappedValue: new FormControl(valueMap.output.mappedValue, Validators.required),
          color: new FormControl(valueMap.output.color),
          bgcolor: new FormControl(valueMap.output.bgcolor),
          icon: new FormControl(valueMap.output.icon),
        }),
      }));
    });
    this.valuesMapFormArray.patchValue(value);
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  addValueMap() {
    this.valuesMapFormArray.push(new FormGroup({
      value: new FormControl('', [Validators.required]),
      output: new FormGroup({
        mappedValue: new FormControl('', Validators.required),
        color: new FormControl(''),
        bgcolor: new FormControl(''),
        icon: new FormControl(''),
      }),
    }));
  }

  removeValueMap(index) {
    this.valuesMapFormArray.removeAt(index);
  }

  get valuesMapFormArray() {
    return this.valuesMapForm.controls.valuesMap as FormArray;
  }

}
