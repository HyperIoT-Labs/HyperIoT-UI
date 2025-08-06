import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from 'components';
import { PageStatusEnum } from '../model/pageStatusEnum';
import { RuleEngineService, HPacket } from 'core';

@Component({
  selector: 'hyt-statistics-step',
  templateUrl: './statistics-step.component.html',
  styleUrls: ['./statistics-step.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatisticsStepComponent implements OnInit {

  currentPacket: HPacket;

  statisticsForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  errors: HYTError[] = [];

  algorithmOptions: SelectOption[] = [
    { value: '0', label: $localize`:@@HYT_average:Average` },
    { value: '1', label: $localize`:@@HYT_media_2_fields:Media 2 fields` },
    { value: '3', label: $localize`:@@HYT_media_3_fields:Media 3 fields` },
    { value: '4', label: $localize`:@@HYT_predictive:Predictive` },
    { value: '5', label: $localize`:@@HYT_regression:Regression` },
    { value: '6', label: $localize`:@@HYT_string:String` },
    { value: '7', label: $localize`:@@HYT_variance:Variance` }
  ];

  timeRangeOptions: SelectOption[] = [
    { value: '0', label: $localize`:@@HYT_hourly:Hourly` },
    { value: '1', label: $localize`:@@HYT_daily:Daily` },
    { value: '3', label: $localize`:@@HYT_weekly:Weekly` },
    { value: '4', label: $localize`:@@HYT_monthly:Monthly` },
    { value: '5', label: $localize`:@@HYT_quarterly:Quarterly` },
    { value: '6', label: $localize`:@@HYT_four_monthly:Four monthly` },
    { value: '7', label: $localize`:@@HYT_half_yearly:Half yearly` },
    { value: '8', label: $localize`:@@HYT_annual:Annual` }
  ];

  statisticsFields: SelectOption[] = [
    { value: 'Temperature', label: $localize`:@@HYT_temperature:Temperature` },
    { value: 'Humidity', label: $localize`:@@HYT_humidity:Humidity` }
  ];

  enrichmentRules: SelectOption[] = [
    { value: JSON.stringify({ actionName: 'AddCategoryRuleAction', ruleId: 0, categoryIds: null }), label: $localize`:@@HYT_categories:Categories` },
    { value: JSON.stringify({ actionName: 'AddTagRuleAction', ruleId: 0, tagIds: null }), label: $localize`:@@HYT_tags:Tags` },
    { value: JSON.stringify({ actionName: 'ValidateHPacketRuleAction', ruleId: 0 }), label: $localize`:@@HYT_packet:Packet` }// TODO actionName is wrong
  ];

  enrichmentType = '';

  assetTags: number[] = [];
  assetCategories: number[] = [];

  constructor(
    private rulesService: RuleEngineService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.statisticsForm = this.fb.group({});
    this.rulesService.findAllRuleActions('ENRICHMENT').subscribe(
      res => { } // TODO this.enrichmentRules = res
    );
  }

  createStatistic() {

    this.errors = [];

  }

  invalid() {
    return true;
  }

  getError(field: string): string {
    return (this.errors.find(x => x.container === field)) ? this.errors.find(x => x.container === field).message : null;
  }

  enrichmentTypeChanged(event) {
    if (event.value) {
      this.enrichmentType = JSON.parse(event.value).actionName;
    }
  }

  // Tags

  updateAssetTag(event) {
    this.assetTags = event;
  }

  // Category

  updateAssetCategory(event) {
    this.assetCategories = event;
  }

  packetChanged(event) {
    this.currentPacket = event;
  }

}
