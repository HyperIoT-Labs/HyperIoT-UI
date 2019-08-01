import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

@Component({
  selector: 'hyt-widget-settings-dialog',
  templateUrl: './widget-settings-dialog.component.html',
  styleUrls: ['./widget-settings-dialog.component.css']
})
export class WidgetSettingsDialogComponent implements OnInit, OnDestroy {
  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();
  modalApply: Subject<any> = new Subject();
  @Input() widget;
  @Input() widgetName;
  private widgetId: string;

  constructor(
    private viewContainer: ElementRef,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.widgetId = this.activatedRoute.snapshot.paramMap.get('widgetId');
  }

  ngOnInit() {
    this.viewContainer.nativeElement
      .addEventListener('click', this.dismiss.bind(this));
    this.open();
  }

  ngOnDestroy() {
    this.viewContainer.nativeElement
      .removeEventListener('click', this.dismiss.bind(this));
  }

  getWidgetId() {
    return this.widgetId;
  }

  setWidget(w: any) {
    this.widget = w;
    this.widgetName = w.name;
  }

  confirm($event) {
    // common config options
    this.widget.name = this.widgetName;
    // signal 'apply' to widget specific config component
    this.modalApply.next('apply');
    // reconfigure widget instance with new values
    this.widget.instance.configure();
    // close dialog
    this.close($event);
  }

  dismiss(e: any) {
    if (e.target === this.viewContainer.nativeElement) {
      this.close(e);
    }
  }

  open() {
    // TODO: init stuff goes here
  }

  close($event) {
    this.router.navigate(
      ['../', { outlets: { modal: null } }],
      { relativeTo: this.activatedRoute }
    );
    this.modalClose.emit($event);
  }
}
