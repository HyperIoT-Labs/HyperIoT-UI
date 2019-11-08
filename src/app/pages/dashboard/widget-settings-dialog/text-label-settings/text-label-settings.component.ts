import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { NgForm, ControlContainer } from '@angular/forms';

@Component({
  selector: 'hyt-text-label-settings',
  templateUrl: './text-label-settings.component.html',
  styleUrls: ['./text-label-settings.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class TextLabelSettingsComponent implements OnInit, OnDestroy {
  subscription: any;
  @Input() modalApply: Observable<any>;
  @Input() widget;

  labelText: string;

  constructor(public settingsForm: NgForm) { }

  ngOnInit() {
    this.labelText = this.widget.config.labelText;
    this.subscription = this.modalApply.subscribe((event) => {
        if (event === 'apply') {
          this.apply();
        }
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  apply() {
    this.widget.config.labelText = this.labelText;
  }

}
