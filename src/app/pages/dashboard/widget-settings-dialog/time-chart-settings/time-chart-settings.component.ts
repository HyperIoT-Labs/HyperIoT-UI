import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';

import { Subject } from 'rxjs';

import { PacketSelectComponent } from '../packet-select/packet-select.component';

@Component({
    selector: 'hyt-time-chart-settings',
    templateUrl: './time-chart-settings.component.html',
    styleUrls: ['../common.css', './time-chart-settings.component.css'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class TimeChartSettingsComponent implements OnInit, OnDestroy {
    @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
    @Input() modalApply: Subject<any>;
    @Input() widget;
    selectedFields = [];
    private defaultConfig = {
        timeAxisRange: 10,
        maxDataPoints: 100,
        timeWindow: 60,
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
            }
        }
    };

    constructor(public settingsForm: NgForm) { }

    ngOnInit() {
        if (this.widget.config.seriesConfig == null || this.widget.config.seriesConfig.length === 0) {
            Object.assign(this.widget.config, this.defaultConfig);
        }
        this.modalApply.subscribe((event) => {
            if (event === 'apply') {
                this.apply();
            }
        });
    }
    ngOnDestroy() {
        this.modalApply.unsubscribe();
    }

    onSelectedFieldsChange(fields) {
        this.selectedFields = fields;
    }

    apply() {
        this.packetSelect.apply();
    }
}
