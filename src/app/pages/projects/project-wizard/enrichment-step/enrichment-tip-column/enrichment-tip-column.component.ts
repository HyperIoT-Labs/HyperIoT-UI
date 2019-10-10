import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Rule } from '@hyperiot/core';
import { TableStatusEnum } from '../../model/pageStatusEnum';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-enrichment-tip-column',
  templateUrl: './enrichment-tip-column.component.html',
  styleUrls: ['./enrichment-tip-column.component.scss']
})
export class EnrichmentTipColumnComponent implements OnInit {

  enrichmentRules: Rule[];

  @Output() copyEnrichmentRule = new EventEmitter<Rule>();

  @Output() updateEnrichmentRule = new EventEmitter<Rule>();

  @Output() deleteEnrichmentRule = new EventEmitter<Rule>();

  tableStatus: TableStatusEnum = TableStatusEnum.Loading;

  constructor(
    private projectWizardService: ProjectWizardService
  ) { }

  ngOnInit() {
    this.projectWizardService.enrichmentRules$.subscribe(
      (res: Rule[]) => {
        this.enrichmentRules = res;
        this.tableStatus = TableStatusEnum.Ok;
      },
      err => this.tableStatus = TableStatusEnum.Error
    )
  }

  copy(data) {
    this.copyEnrichmentRule.emit(data);
  }
  update(data) {
    this.updateEnrichmentRule.emit(data);
  }
  delete(data) {
    this.deleteEnrichmentRule.emit(data);
  }

}
