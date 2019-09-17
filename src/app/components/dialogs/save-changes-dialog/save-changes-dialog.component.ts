import { Component, Inject, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'hyt-save-changes-dialog',
  templateUrl: './save-changes-dialog.component.html',
  styleUrls: ['./save-changes-dialog.component.scss']
})
export class SaveChangesDialogComponent implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<SaveChangesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @ViewChild(HTMLElement, {static: true}) public viewRef: ElementRef
  ) { }

  ngAfterViewInit() {
    const el: HTMLElement = this.viewRef.nativeElement;
    (el.querySelector('button[defaultButton]') as HTMLElement).focus();
  }

}
