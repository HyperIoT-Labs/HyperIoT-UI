import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, UntypedFormArray, UntypedFormControl, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
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

  valuesMapForm = new UntypedFormGroup({
    defaultValue: new UntypedFormControl('UNKNOWN'), // Validators.required
    valuesMap: new UntypedFormArray([]),
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
      this.valuesMapFormArray.push(new UntypedFormGroup({
        value: new UntypedFormControl(valueMap.value),// Validators.required
        output: new UntypedFormGroup({
          mappedValue: new UntypedFormControl(valueMap.output.mappedValue),// Validators.required
          color: new UntypedFormControl(valueMap.output.color),
          bgcolor: new UntypedFormControl(valueMap.output.bgcolor),
          icon: new UntypedFormControl(valueMap.output.icon),
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
    this.valuesMapFormArray.push(new UntypedFormGroup({
      value: new UntypedFormControl(''),// Validators.required
      output: new UntypedFormGroup({
        mappedValue: new UntypedFormControl(''),// Validators.required
        color: new UntypedFormControl('#212529'),
        bgcolor: new UntypedFormControl('#e4e4e4'),
        icon: new UntypedFormControl(''),
      }),
    }));
  }

  removeValueMap(index) {
    this.valuesMapFormArray.removeAt(index);
  }

  get valuesMapFormArray() {
    return this.valuesMapForm.controls.valuesMap as UntypedFormArray;
  }

}
