import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';

import { Observable } from 'rxjs';

import { PacketSelectComponent } from '../packet-select/packet-select.component';
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'hyperiot-time-chart-settings',
    templateUrl: './time-chart-settings.component.html',
    styleUrls: ['./time-chart-settings.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class TimeChartSettingsComponent implements OnInit, OnDestroy {
    @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
    subscription: any;
    @Input() modalApply: Observable<any>;
    @Input() widget;
    @Input() areaId;
    @Input() hDeviceId;
    selectedFields = [];
    private defaultConfig = {
        timeAxisRange: 10,
        //no limits in data points
        maxDataPoints: 0,
        timeWindow: 60,
        refreshIntervalMillis: 100,
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

    constructor(public settingsForm: NgForm, private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        if (this.widget.config == null) {
            this.widget.config = {};
        }

        if (this.widget.config.seriesConfig == null || this.widget.config.seriesConfig.length === 0) {
            Object.assign(this.widget.config, this.defaultConfig);
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
        this.packetSelect.apply();
    }
}
