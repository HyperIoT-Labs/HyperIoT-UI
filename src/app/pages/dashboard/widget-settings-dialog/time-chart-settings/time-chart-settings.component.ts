import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { PacketSelectComponent } from '../packet-select/packet-select.component';

@Component({
  selector: 'hyt-time-chart-settings',
  templateUrl: './time-chart-settings.component.html',
  styleUrls: ['./time-chart-settings.component.css']
})
export class TimeChartSettingsComponent implements OnInit, OnDestroy {
  @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
  @Input() modalApply: Subject<any>;
  @Input() widget;
  seriesTitle = 'Untitled';
  private defaultConfig = {
    timeAxisRange: 10,
    maxDataPoints: 100,
    timeWindow: 60,
    seriesConfig: [
      {
        series: 'temperature',
        config: {
          yaxis: 'y2'
        },
        layout: {
          title: {
            font: {
              size: 14,
              color: '#16A4FA'
            },
            xref: 'container',
            yref: 'container',
            x: 0,
            y: 1,
            pad: {
              t: 10,
              l: 10
            },
            text: '<b>Real time temperature and humidity</b>'
          },
          yaxis2: {
            title: 'temperature',
            titlefont: {
              color: '#00f'
            },
            tickfont: {
              color: '#00f'
            },
            anchor: 'free',
            overlaying: 'y',
            side: 'right',
            position: 1,
            range: [
              -50,
              50
            ]
          }
        }
      },
      {
        series: 'humidity',
        layout: {
          yaxis: {
            title: 'humidity',
            titlefont: {
              color: 'darkorange'
            },
            tickfont: {
              color: 'darkorange'
            }
          }
        }
      }
    ]
  };

  ngOnInit() {
    if (this.widget.config.seriesConfig == null) {
      Object.assign(this.widget.config, this.defaultConfig);
    }
    this.seriesTitle = this.widget.config.seriesConfig[0].layout.title.text;
    this.modalApply.subscribe((event) => {
      if (event === 'apply') {
        this.apply();
      }
    });
  }
  ngOnDestroy() {
    this.widget.config.seriesConfig[0].layout.title.text = this.seriesTitle;
    this.modalApply.unsubscribe();
  }

  apply() {
    this.packetSelect.apply();
  }
}
