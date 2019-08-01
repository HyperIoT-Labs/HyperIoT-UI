import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'hyt-text-label-settings',
  templateUrl: './text-label-settings.component.html',
  styleUrls: ['./text-label-settings.component.css']
})
export class TextLabelSettingsComponent implements OnInit, OnDestroy {
  @Input() modalApply: Subject<any>;
  @Input() widget;

  labelText: string;

  ngOnInit() {
    this.labelText = this.widget.config.labelText;
    this.modalApply.subscribe((event) => {
      if (event === 'apply') {
        this.apply();
      }
    });
  }
  ngOnDestroy() {
    this.modalApply.unsubscribe();
  }

  apply() {
    this.widget.config.labelText = this.labelText;
  }

}
