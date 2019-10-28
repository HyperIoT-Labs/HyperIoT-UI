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
import { PacketEventsDataComponent } from './project-forms/packet-events-data/packet-events-data.component';
import { AssetCategoryComponent } from './project-forms/packet-enrichment-form/asset-category/asset-category.component';
import { AssetTagComponent } from './project-forms/packet-enrichment-form/asset-tag/asset-tag.component';

import { ProjectWizardComponent, ProjectWizardCanDeactivate } from './project-wizard/project-wizard.component';
import { DeviceSelectComponent } from './project-wizard/device-select/device-select.component';
import { PacketSelectComponent } from './project-wizard/packet-select/packet-select.component';

import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';

//TO DO. Remove imports
import { EnrichmentStepComponent } from './project-wizard/enrichment-step/enrichment-step.component';
import { EnrichmentTipColumnComponent } from './project-wizard/enrichment-step/enrichment-tip-column/enrichment-tip-column.component';
import { StatisticsStepComponent } from './project-wizard/statistics-step/statistics-step.component';
import { EventsStepComponent } from './project-wizard/events-step/events-step.component';
import { PacketEventComponent } from './project-wizard/events-step/packet-event/packet-event.component';
import { EventMailComponent } from './project-wizard/events-step/packet-event/event-mail/event-mail.component';
import { EventTipColumnComponent } from './project-wizard/events-step/event-tip-column/event-tip-column.component';
import { SelectableTextComponent } from './project-wizard/events-step/packet-event/event-mail/selectable-text/selectable-text.component';

@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectWizardComponent,
    EventsStepComponent,
    StatisticsStepComponent,
    EnrichmentStepComponent,
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
    PacketEventsDataComponent,
    SelectableTextComponent,
    PacketSelectComponent,
    EnrichmentTipColumnComponent,
    EventTipColumnComponent,
    PacketEventComponent,
    GenericSummaryListComponent,
    DeviceSelectComponent
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
    MatAutocompleteModule,
    MatInputModule,
    MatExpansionModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ProjectsModule { }
