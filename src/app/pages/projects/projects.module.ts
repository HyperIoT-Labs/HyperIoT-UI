import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsComponent } from './projects.component';
import { HyperiotComponentsModule } from '@hyperiot/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProjectCardComponent } from './project-card/project-card.component';

import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { GenericSummaryListComponent } from './project-detail/generic-summary-list/generic-summary-list.component';

import { ProjectFormComponent } from './project-forms/project-form/project-form.component';
import { DeviceFormComponent } from './project-forms/device-form/device-form.component';
import { PacketFormComponent } from './project-forms/packet-form/packet-form.component';
import { PacketFieldsFormComponent } from './project-forms/packet-fields-form/packet-fields-form.component';
import { PacketEnrichmentFormComponent } from './project-forms/packet-enrichment-form/packet-enrichment-form.component';
import { RuleDefinitionComponent } from './project-forms/rule-definition/rule-definition.component';
import { PacketStatisticsFormComponent } from './project-forms/packet-statistics-form/packet-statistics-form.component';
import { PacketEventsFormComponent } from './project-forms/packet-events-form/packet-events-form.component';
import { EventMailComponent } from './project-forms/packet-events-form/event-mail/event-mail.component';
import { SelectableTextComponent } from './project-forms/packet-events-form/event-mail/selectable-text/selectable-text.component';
import { AssetCategoryComponent } from './project-forms/packet-enrichment-form/asset-category/asset-category.component';
import { AssetTagComponent } from './project-forms/packet-enrichment-form/asset-tag/asset-tag.component';

import { ProjectWizardComponent } from './project-wizard/project-wizard.component';
import { DeviceSelectComponent } from './project-wizard/device-select/device-select.component';
import { PacketSelectComponent } from './project-wizard/packet-select/packet-select.component';

import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  MatCardModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatMenuModule,
  MatRippleModule
} from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';

import { StatisticsStepComponent } from './project-wizard/statistics-step/statistics-step.component';
import { WizardReportModalComponent } from './project-wizard/wizard-report-modal/wizard-report-modal.component';
import { WizardOptionsModalComponent } from './project-wizard/wizard-options-modal/wizard-options-modal.component';
import { WizardDeactivationModalComponent } from './project-wizard/wizard-deactivation-modal/wizard-deactivation-modal.component';
import { ApplicationFormComponent } from './project-forms/application-form/application-form.component';

@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectWizardComponent,
    ProjectCardComponent,
    RuleDefinitionComponent,
    ProjectDetailComponent,
    ProjectFormComponent,
    DeviceFormComponent,
    PacketFormComponent,
    EventMailComponent,
    AssetCategoryComponent,
    AssetTagComponent,
    SelectableTextComponent,
    PacketFieldsFormComponent,
    PacketEnrichmentFormComponent,
    PacketStatisticsFormComponent,
    PacketEventsFormComponent,
    SelectableTextComponent,
    PacketSelectComponent,
    GenericSummaryListComponent,
    DeviceSelectComponent,
    StatisticsStepComponent,
    WizardReportModalComponent,
    WizardOptionsModalComponent,
    WizardDeactivationModalComponent,
    ApplicationFormComponent
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatMenuModule,
    CommonModule,
    HyperiotComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatChipsModule,
    MatRippleModule,
    MatAutocompleteModule,
    MatInputModule,
    MatExpansionModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ProjectsModule { }
