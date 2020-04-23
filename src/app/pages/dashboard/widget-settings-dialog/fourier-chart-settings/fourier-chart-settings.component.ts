import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { NgForm, ControlContainer } from '@angular/forms';
import { Observable } from 'rxjs';
import { PacketSelectComponent } from '../packet-select/packet-select.component';

@Component({
  selector: 'hyt-fourier-chart-settings',
  templateUrl: './fourier-chart-settings.component.html',
  styleUrls: ['./fourier-chart-settings.component.scss'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class FourierChartSettingsComponent  implements OnInit, OnDestroy {
  @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
  subscription: any;
  @Input() modalApply: Observable<any>;
  @Input() widget;
  @Input() areaId;
  sampleRate = 500;
  showSamples = 2;
  bufferSamples = 20;
  selectedFields = [];
  private defaultConfig = {
      showSamples: 2,
      bufferSamples: 20,
      layout: {
          showlegend: true,
          legend: {
              orientation: 'h',
              x: 0.25,
              y: 1,
              traceorder: 'normal',
              font: {
                  family: 'sans-serif',
                  size: 10,
                  color: '#000'
              },
              bgcolor: '#FFFFFF85',
              borderwidth: 0
          },
          xaxis: {
              type: 'linear',
              title: {
                  text: 'Frequency (Hz)'
              },
              autorange: true,
              showticklabels: true,
              showgrid: true,
              showline: false,
              zeroline: false,
              anchor: 'y',
              side: 'bottom'
          },
          yaxis: {
            type: 'linear',
            title: {
                text: 'Magnitude'
            },
            autorange: true,
            showticklabels: true,
            showgrid: true,
            showline: false,
            zeroline: false,
            anchor: 'x',
            side: 'left'
          },
          autosize: true,
          dragmode: 'zoom',
          hovermode: 'closest'
    }
  };

  constructor(public settingsForm: NgForm) { }

  ngOnInit() {
      if (this.widget.config == null) {
          this.widget.config = {};
      }
      if (this.widget.config.seriesConfig == null || this.widget.config.seriesConfig.length === 0) {
          Object.assign(this.widget.config, this.defaultConfig);
      }
      if (this.widget.config.sampleRate) {
        this.sampleRate = +this.widget.config.sampleRate;
      }
      if (this.widget.config.showSamples) {
        this.showSamples = +this.widget.config.showSamples;
      }
      if (this.widget.config.bufferSamples) {
        this.bufferSamples = +this.widget.config.bufferSamples;
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
    this.widget.config.sampleRate = this.sampleRate;
    this.widget.config.showSamples = this.showSamples;
    this.widget.config.bufferSamples = this.bufferSamples;
    this.packetSelect.apply();
  }
}
