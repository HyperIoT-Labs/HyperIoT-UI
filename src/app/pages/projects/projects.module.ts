import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectWizardComponent, ProjectWizardCanDeactivate } from './project-wizard/project-wizard.component';
import { ProjectsComponent } from './projects.component';
import { HyperiotComponentsModule } from '@hyperiot/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule, MatButtonModule, MatRadioModule, MatProgressSpinnerModule, MatProgressBarModule } from '@angular/material';

import { DevicesStepComponent } from './project-wizard/devices-step/devices-step.component';
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
import { EventMailComponent } from './project-wizard/events-step/event-mail/event-mail.component';


import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { AssetCategoryComponent } from './project-wizard/asset-category/asset-category.component';
import { AssetTagComponent } from './project-wizard/asset-tag/asset-tag.component';
import { SelectableTextComponent } from './project-wizard/events-step/event-mail/selectable-text/selectable-text.component';
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
    PacketDataComponent,
    EventMailComponent,
    AssetCategoryComponent,
    AssetTagComponent,
    SelectableTextComponent
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    CommonModule,
    HyperiotComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectsModule { }
