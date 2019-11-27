import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { PageStatusEnum } from '../model/pageStatusEnum';
import { RulesService, HPacket } from '@hyperiot/core';

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
    { value: '0', label: 'Average' },
    { value: '1', label: 'Media 2 fields' },
    { value: '3', label: 'Media 3 fields' },
    { value: '4', label: 'Predective' },
    { value: '5', label: 'Regression' },
    { value: '6', label: 'String' },
    { value: '7', label: 'Variance' }
  ];

  timeRangeOptions: SelectOption[] = [
    { value: '0', label: 'Hours' },
    { value: '1', label: 'Daily' },
    { value: '3', label: 'Weekly' },
    { value: '4', label: 'Monthly' },
    { value: '5', label: 'Quarterly' },
    { value: '6', label: 'Four monthly' },
    { value: '7', label: 'Half yearly' },
    { value: '8', label: 'Annual' }
  ];

  statisticsFields: SelectOption[] = [
    { value: 'Temperature', label: 'Temperature' },
    { value: 'Humidity', label: 'Humidity' }
  ];

  enrichmentRules: SelectOption[] = [
    { value: JSON.stringify({ actionName: 'AddCategoryRuleAction', ruleId: 0, categoryIds: null }), label: 'Categories' },
    { value: JSON.stringify({ actionName: 'AddTagRuleAction', ruleId: 0, tagIds: null }), label: 'Tags' },
    { value: JSON.stringify({ actionName: 'ValidateHPacketRuleAction', ruleId: 0 }), label: 'Packet' }// TODO actionName is wrong
  ];

  enrichmentType = '';

  assetTags: number[] = [];
  assetCategories: number[] = [];

  constructor(
    private rulesService: RulesService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.statisticsForm = this.fb.group({});
    this.rulesService.findAllRuleActions('ENRICHMENT').subscribe(
      res => { }// TODO this.enrichmentRules = res
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
