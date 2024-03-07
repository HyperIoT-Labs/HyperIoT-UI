import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
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

  value: FieldValuesMap;

  valuesMapForm = new FormGroup({
    defaultValue: new FormControl('UNKNOWN'), // Validators.required
    valuesMap: new FormArray([]),
  });

  onChange: any = () => { };
  onTouched: any = () => { };

  ngOnInit(): void {
    this.value = this.valuesMapForm.value;
    this.valuesMapForm.valueChanges.subscribe(res => {
      this.value = res;
      this.onChange(this.value);
    });
  }

  writeValue(value: FieldValuesMap): void {
    if (!value) {
      return;
    }
    this.valuesMapForm.controls.defaultValue.patchValue(value.defaultValue);
    this.valuesMapFormArray.clear();
    value.valuesMap.forEach(valueMap => {
      this.valuesMapFormArray.push(new FormGroup({
        value: new FormControl(valueMap.value),// Validators.required
        output: new FormGroup({
          mappedValue: new FormControl(valueMap.output.mappedValue),// Validators.required
          color: new FormControl(valueMap.output.color),
          bgcolor: new FormControl(valueMap.output.bgcolor),
          icon: new FormControl(valueMap.output.icon),
        }),
      }));
    });
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.onChange(this.value);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  addValueMap() {
    this.valuesMapFormArray.push(new FormGroup({
      value: new FormControl(''),// Validators.required
      output: new FormGroup({
        mappedValue: new FormControl(''),// Validators.required
        color: new FormControl('#212529'),
        bgcolor: new FormControl('#e4e4e4'),
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
