import { Component, Inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'hyt-delete-confirm-dialog',
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrls: ['./delete-confirm-dialog.component.scss']
})
export class DeleteConfirmDialogComponent implements AfterViewInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @ViewChild(HTMLElement, {static: true}) public viewRef: ElementRef
  ) { }

  ngAfterViewInit() {
    const el: HTMLElement = this.viewRef.nativeElement;
    (el.querySelector('button[defaultButton]') as HTMLElement).focus();
  }

}
