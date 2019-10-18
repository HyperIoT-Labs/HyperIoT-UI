import { Component, OnInit } from '@angular/core';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { PageStatusEnum } from '../model/pageStatusEnum';
import { RulesService, HPacket } from '@hyperiot/core';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'hyt-statistics-step',
  templateUrl: './statistics-step.component.html',
  styleUrls: ['./statistics-step.component.scss']
})
export class StatisticsStepComponent implements OnInit {

  currentPacket: HPacket;

  statisticsForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  errors: HYTError[] = [];

  algorithmOptions: SelectOption[] = [
    { value: '0', label: this.i18n('HYT_average') },
    { value: '1', label: this.i18n('HYT_media_2_fields') },
    { value: '3', label: this.i18n('HYT_media_3_fields') },
    { value: '4', label: this.i18n('HYT_predective') },
    { value: '5', label: this.i18n('HYT_regression') },
    { value: '6', label: this.i18n('HYT_string') },
    { value: '7', label: this.i18n('HYT_variance') }
  ];

  timeRangeOptions: SelectOption[] = [
    { value: '0', label: this.i18n('HYT_hours') },
    { value: '1', label: this.i18n('HYT_daily') },
    { value: '3', label: this.i18n('HYT_weekly') },
    { value: '4', label: this.i18n('HYT_monthly') },
    { value: '5', label: this.i18n('HYT_quarterly') },
    { value: '6', label: this.i18n('HYT_four_monthly') },
    { value: '7', label: this.i18n('HYT_half_yearly') },
    { value: '8', label: this.i18n('HYT_annual') }
  ];

  enrichmentRules: SelectOption[] = [
    { value: JSON.stringify({ actionName: "AddCategoryRuleAction", ruleId: 0, categoryIds: null }), label: this.i18n('HYT_categories') },
    { value: JSON.stringify({ actionName: "AddTagRuleAction", ruleId: 0, tagIds: null }), label: this.i18n('HYT_tags') },
    { value: JSON.stringify({ actionName: "ValidateHPacketRuleAction", ruleId: 0 }), label: this.i18n('HYT_packet') }//TODO actionName is wrong
  ];

  constructor(
    private rulesService: RulesService,
    private fb: FormBuilder,
    private i18n: I18n
  ) { }

  ngOnInit() {
    this.statisticsForm = this.fb.group({});
    this.rulesService.findAllRuleActions('ENRICHMENT').subscribe(
      res => { }//TODO //this.enrichmentRules = res
    )
  }

  createStatistic() {

    this.errors = [];

  }

  invalid() {
    return true;
  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  enrichmentType: string = '';

  enrichmentTypeChanged(event) {
    if (event.value)
      this.enrichmentType = JSON.parse(event.value).actionName;
  }

  //Tags

  assetTags: number[] = [];

  updateAssetTag(event) {
    this.assetTags = event;
  }

  //Category

  assetCategories: number[] = [];

  updateAssetCategory(event) {
    this.assetCategories = event;
  }

  packetChanged(event) {
    this.currentPacket = event;
  }

}
