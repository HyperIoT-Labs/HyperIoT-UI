import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';

import { Observable } from 'rxjs';

import { PacketSelectComponent } from '../packet-select/packet-select.component';
import {ActivatedRoute} from "@angular/router";
import { Rule, RulesService } from 'core';

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
    @Input() checkbox: boolean;
    selectedFields = [];
    selectedPackets = [];

    thresholds: any = [];
    thresholdActive: boolean = false;
    selectedThresholdsIds: number[] = [];

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

    constructor(public settingsForm: NgForm, private activatedRoute: ActivatedRoute, private ruleService: RulesService) { }

    ngOnInit() {
        if (this.widget.config == null) {
            this.widget.config = {};
        }

        if (this.widget.config.seriesConfig == null || this.widget.config.seriesConfig.length === 0) {
            Object.assign(this.widget.config, this.defaultConfig);
        }
        if (this.widget.config.threshold) {
            this.thresholdActive = this.widget.config.threshold.thresholdActive;
            this.selectedThresholdsIds = this.widget.config.threshold.thresholdsIds ? this.widget.config.threshold.thresholdsIds : [];
            this.isChecked();
        } else {
            this.widget.config.threshold = {
                thresholdActive: this.thresholdActive,
                thresholdsIds: this.selectedThresholdsIds
            }
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
        this.isChecked();
    }

    onSelectedPacketChange(packet) {
        this.selectedPackets = [packet.id];
    }

    apply() {
        this.widget.config.threshold = {
            thresholdActive: this.thresholdActive,
            thresholdsIds: this.selectedThresholdsIds
        }
        this.packetSelect.apply();
    }

    isChecked() {
        this.widget.config.threshold = {
            thresholdActive: this.thresholdActive,
            thresholdsIds: this.selectedThresholdsIds
        }
        if (!this.thresholdActive) {
            this.widget.config.threshold.thresholdsIds = [];
            return;
        }

        this.ruleService.findAllRuleByProjectId(this.widget.projectId).subscribe({
            next: (rules) => {
                if (this.selectedFields.length === 0 && !this.widget.config.packetId) return
                this.thresholds = rules.filter((rule) => {
                    let ruleDefinition = rule.ruleDefinition;
                    if (rule.type !== Rule.TypeEnum.ALARMEVENT) return false;
                    ruleDefinition = ruleDefinition.replace(/"/g, '').trim();
                    const ruleArray: string[] = ruleDefinition.match(/[^AND|OR]+(AND|OR)?/g).map(x => x.trim());
                    const packets: number[] = this.widget.config.packetId 
                        ? this.widget.config.packetId 
                        : this.selectedPackets;
            
                    const fields: number[] = this.widget.config.packetFields 
                        && Object.keys(this.widget.config.packetFields).length > 0 
                        ? [...new Set(Object.keys(this.widget.config.packetFields))].map(field => parseInt(field))
                        : [...new Set(this.selectedFields.map(field => parseInt(field.id)))];
            
                    for (let k = 0; k < ruleArray.length; k++) {
                        const tempSplitted: string[] = ruleArray[k].split(' ').filter(i => i);
                        const packetFieldPart = tempSplitted.shift();
                        const splitted: string[] = packetFieldPart.split('.');
            
                        if (splitted.length === 1) {
                            if (!(packets && (typeof packets === 'number' ? packets === parseInt(splitted[0]) : packets.includes(parseInt(splitted[0]))))) {
                                return false;
                            }
                        } else if (splitted.length === 2) {
                            if (!(packets && (typeof packets === 'number' ? packets === parseInt(splitted[0]) : packets.includes(parseInt(splitted[0]))) && fields.includes(parseInt(splitted[1])))) {
                                return false;
                            }
                        }
                    }
                    return true;
                });
            },            
            error: (err) => {
                console.error('Error retrieving thresholds', err);
            }
        })
    }
}
