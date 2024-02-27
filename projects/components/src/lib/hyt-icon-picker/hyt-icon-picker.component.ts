import { Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DialogService } from '../hyt-dialog/dialog.service';
import { HytIconPickerListComponent } from './hyt-icon-picker-list/hyt-icon-picker-list.component';
import { DialogLayout } from '../hyt-dialog/dialog.models';

@Component({
  selector: 'hyt-icon-picker',
  templateUrl: './hyt-icon-picker.component.html',
  styleUrls: ['./hyt-icon-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HytIconPickerComponent),
      multi: true,
    }
  ],
})
export class HytIconPickerComponent implements ControlValueAccessor {

  value: string;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(
    private dialogService: DialogService,
  ) { }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  openIconPickerList() {
    const layout: DialogLayout = { width: '900px', height: '700px', backgroundClosable: true };
    const dialogRef = this.dialogService.open(HytIconPickerListComponent, { data: this.value, ...layout  });
    dialogRef.afterClosed().subscribe(res => {
      this.value = res;
      this.onChange(this.value);
    });
  }

}
