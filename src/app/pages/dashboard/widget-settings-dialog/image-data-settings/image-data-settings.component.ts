import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { PacketSelectComponent } from '../packet-select/packet-select.component';
import { Observable } from 'rxjs';
import { NgForm, ControlContainer } from '@angular/forms';

@Component({
  selector: 'hyt-image-data-settings',
  templateUrl: './image-data-settings.component.html',
  styleUrls: ['./image-data-settings.component.scss'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class ImageDataSettingsComponent implements OnInit, OnDestroy {
  @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
  subscription: any;
  @Input() modalApply: Observable<any>;
  @Input() widget;
  @Input() areaId;

  imageWidth = 160;
  imageHeight = 120;
  selectedFields = [];

  private defaultConfig = {
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight
  };

  constructor(public settingsForm: NgForm) { }

  ngOnInit() {
      if (this.widget.config == null) {
          this.widget.config = {};
      }
      if (this.widget.config.imageWidth == null || this.widget.config.imageHeight == null) {
          Object.assign(this.widget.config, this.defaultConfig);
      }
      if (this.widget.config.imageWidth) {
        this.imageWidth = +this.widget.config.imageWidth;
      }
      if (this.widget.config.imageHeight) {
        this.imageHeight = +this.widget.config.imageHeight;
      }
      this.subscription = this.modalApply.subscribe((event) => {
          if (event === 'apply') {
              this.apply();
          }
      });
  }
  ngOnDestroy() {
      if (this.subscription) {
          this.subscription.unsubscribe();
      }
  }

  onSelectedFieldsChange(fields) {
    this.selectedFields = fields;
  }

  apply() {
    this.widget.config.imageWidth = this.imageWidth;
    this.widget.config.imageHeight = this.imageHeight;
    console.log('aaply', this.widget.config)
    this.packetSelect.apply();
  }
}
