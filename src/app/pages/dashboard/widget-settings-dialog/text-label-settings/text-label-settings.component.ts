import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NgForm, ControlContainer } from '@angular/forms';

@Component({
  selector: 'hyt-text-label-settings',
  templateUrl: './text-label-settings.component.html',
  styleUrls: ['./text-label-settings.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class TextLabelSettingsComponent implements OnInit, OnDestroy {
  @Input() modalApply: Subject<any>;
  @Input() widget;

  labelText: string;

  constructor(public settingsForm: NgForm) { }

  ngOnInit() {
    this.labelText = this.widget.config.labelText;
    this.modalApply.subscribe((event) => {
        if (event === 'apply') {
          this.apply();
        }
    });
    console.log('PAERNT FORM', this.settingsForm);
    //this.settingsForm.reset();
    // TODO: should rebuild the form group
  }
  ngOnDestroy() {
    this.modalApply.unsubscribe();
  }

  apply() {
    this.widget.config.labelText = this.labelText;
  }

}
