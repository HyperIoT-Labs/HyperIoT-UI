import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectWizardComponent, ProjectWizardCanDeactivate } from './project-wizard/project-wizard.component';
import { ProjectsComponent } from './projects.component';
import { HyperiotComponentsModule } from '@hyperiot/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';

import { DevicesStepComponent } from './project-wizard/devices-step/devices-step.component';
import { DevicesFormComponent } from './project-wizard/devices-step/devices-form/devices-form.component';
import { DevicesHintColumnComponent } from './project-wizard/devices-step/devices-hint-column/devices-hint-column.component';
import { EventsStepComponent } from './project-wizard/events-step/events-step.component';
import { FieldsStepComponent } from './project-wizard/fields-step/fields-step.component';
import { PacketsStepComponent } from './project-wizard/packets-step/packets-step.component';
import { ProjectStepComponent } from './project-wizard/project-step/project-step.component';
import { StatisticsStepComponent } from './project-wizard/statistics-step/statistics-step.component';
import { EnrichmentStepComponent } from './project-wizard/enrichment-step/enrichment-step.component';
import { RuleDefinitionComponent } from './project-wizard/rule-definition/rule-definition.component';

import { ProjectCardComponent } from './project-card/project-card.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectDataComponent } from './project-detail/project-data/project-data.component';
import { DeviceDataComponent } from './project-detail/device-data/device-data.component';
import { PacketDataComponent } from './project-detail/packet-data/packet-data.component';
import { EventMailComponent } from './project-wizard/events-step/packet-event/event-mail/event-mail.component';

import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { AssetCategoryComponent } from './project-wizard/asset-category/asset-category.component';
import { AssetTagComponent } from './project-wizard/asset-tag/asset-tag.component';
import { SelectableTextComponent } from './project-wizard/events-step/packet-event/event-mail/selectable-text/selectable-text.component';
import { PacketFieldsDataComponent } from './project-detail/packet-fields-data/packet-fields-data.component';
import { PacketEnrichmentsDataComponent } from './project-detail/packet-enrichments-data/packet-enrichments-data.component';
import { PacketStatisticsDataComponent } from './project-detail/packet-statistics-data/packet-statistics-data.component';
import { PacketEventsDataComponent } from './project-detail/packet-events-data/packet-events-data.component';
import { PacketSelectComponent } from './project-wizard/packet-select/packet-select.component';
import { PacketFieldComponent } from './project-wizard/fields-step/packet-field/packet-field.component';
import { FieldTipColumnComponent } from './project-wizard/fields-step/field-tip-column/field-tip-column.component';
import { PacketEnrichmentComponent } from './project-wizard/enrichment-step/packet-enrichment/packet-enrichment.component';
import { EnrichmentTipColumnComponent } from './project-wizard/enrichment-step/enrichment-tip-column/enrichment-tip-column.component';
import { EventTipColumnComponent } from './project-wizard/events-step/event-tip-column/event-tip-column.component';
import { PacketEventComponent } from './project-wizard/events-step/packet-event/packet-event.component';
import { GenericSummaryListComponent } from './project-detail/generic-summary-list/generic-summary-list.component';
import { PacketsFormComponent } from './project-wizard/packets-step/packets-form/packets-form.component';
import { PacketsHintColumnComponent } from './project-wizard/packets-step/packets-hint-column/packets-hint-column.component';
import { ProjectHintColumnComponent } from './project-wizard/project-step/project-hint-column/project-hint-column.component';
import { ProjectFormComponent } from './project-wizard/project-step/project-form/project-form.component';
import { DeviceSelectComponent } from './project-wizard/device-select/device-select.component';

@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectWizardComponent,
    DevicesStepComponent,
    EventsStepComponent,
    FieldsStepComponent,
    PacketsStepComponent,
    ProjectStepComponent,
    StatisticsStepComponent,
    EnrichmentStepComponent,
    ProjectCardComponent,
    RuleDefinitionComponent,
    ProjectDetailComponent,
    ProjectDataComponent,
    DeviceDataComponent,
    DevicesFormComponent,
    DevicesHintColumnComponent,
    PacketDataComponent,
    EventMailComponent,
    AssetCategoryComponent,
    AssetTagComponent,
    SelectableTextComponent,
    PacketFieldsDataComponent,
    PacketEnrichmentsDataComponent,
    PacketStatisticsDataComponent,
    PacketEventsDataComponent,
    SelectableTextComponent,
    PacketSelectComponent,
    PacketFieldComponent,
    FieldTipColumnComponent,
    PacketEnrichmentComponent,
    EnrichmentTipColumnComponent,
    EventTipColumnComponent,
    PacketEventComponent,
    GenericSummaryListComponent,
    PacketsFormComponent,
    PacketsHintColumnComponent,
    ProjectHintColumnComponent,
    ProjectFormComponent,
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
