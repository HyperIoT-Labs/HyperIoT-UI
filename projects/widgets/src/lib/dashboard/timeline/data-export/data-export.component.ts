import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from 'components';
import { DataExport } from '../models/data-export,model';

@Component({
  selector: 'hyperiot-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss']
})
export class DataExportComponent implements OnInit {
  form = this.fb.group({
    startTime: '',
    endTime: ''
  });

  private initialFormValue: Record<string, Date> = {
    startTime: undefined,
    endTime: undefined
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: DataExport,
  ) { }

  ngOnInit(): void {
    console.log(this.data);

    const { domain, timeInterval } = this.data;
    if (timeInterval.length) {
      this.initialFormValue = {
        startTime: timeInterval[0],
        endTime: timeInterval[1]
      };
    } else if (domain.length) {
      this.initialFormValue = {
        startTime: domain[0],
        endTime: domain[1]
      };
    }

    this.form.patchValue({ ...this.initialFormValue });
  }

  closeModal(event?: any): void {
    this.dialogRef.close(event);
  }

  export() {
    this.dialogRef.close('save');
  }

  resetForm() {
    this.form.reset({ ...this.initialFormValue });
  }
}
