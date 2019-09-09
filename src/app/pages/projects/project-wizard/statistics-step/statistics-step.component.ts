import { Component, OnInit } from '@angular/core';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { SelectOption } from '@hyperiot/components';

@Component({
  selector: 'hyt-statistics-step',
  templateUrl: './statistics-step.component.html',
  styleUrls: ['./statistics-step.component.scss']
})
export class StatisticsStepComponent implements OnInit {

  statisticsForm: FormGroup;

  errors: HYTError[] = [];

  algorithmOptions: SelectOption[] = [
    { value: '0', label: 'Average' },
    { value: '1', label: 'Media 2 Fields' },
    { value: '3', label: 'Media 3 Fields' },
    { value: '4', label: 'Predective' },
    { value: '5', label: 'Regression' },
    { value: '6', label: 'String' },
    { value: '7', label: 'Variance' }
  ]

  sourceDataOptions: Option[] = [
    { value: '0', label: 'PACKET', checked: true },
    { value: '1', label: 'CATEGORIES' },
    { value: '2', label: 'TAGS' }
  ]

  timeRangeOptions: SelectOption[] = [
    { value: '0', label: 'Hours' },
    { value: '1', label: 'Daily' },
    { value: '3', label: 'Weekly' },
    { value: '4', label: 'Monthly' },
    { value: '5', label: 'Quarterly' },
    { value: '6', label: 'Four-monthly' },
    { value: '7', label: 'Half yearly' },
    { value: '8', label: 'Annual' }
  ]

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.statisticsForm = this.fb.group({});
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

}
