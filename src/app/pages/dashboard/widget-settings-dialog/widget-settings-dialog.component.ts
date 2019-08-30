import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'hyt-widget-settings-dialog',
  templateUrl: './widget-settings-dialog.component.html',
  styleUrls: ['./common.css', './widget-settings-dialog.component.css']
})
export class WidgetSettingsDialogComponent implements OnInit {
  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();
  modalApply: Subject<any> = new Subject();
  @Input() widget;
  @Input() widgetName;
  private widgetId: string;
  @ViewChild(NgForm, { static: true }) settingsForm: NgForm;

  constructor(
    private viewContainer: ElementRef,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.widgetId = this.activatedRoute.snapshot.paramMap.get('widgetId');
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key.toUpperCase() === 'ESCAPE') {
      this.close(event);
    }
  }

  ngOnInit() {
    this.open();
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

  close($event?) {
    this.router.navigate(
      ['../', { outlets: { modal: null } }],
      { relativeTo: this.activatedRoute }
    );
    this.modalClose.emit($event);
  }
}
