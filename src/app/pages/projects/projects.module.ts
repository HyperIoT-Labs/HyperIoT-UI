import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectWizardComponent } from './project-wizard/project-wizard.component';
import { ProjectsComponent } from './projects.component';
import { HyperiotComponentsModule } from '@hyperiot/components';
import { ReactiveFormsModule } from '@angular/forms';
import { DevicesStepComponent } from './project-wizard/devices-step/devices-step.component';
import { EventsStepComponent } from './project-wizard/events-step/events-step.component';
import { FieldsStepComponent } from './project-wizard/fields-step/fields-step.component';
import { PacketsStepComponent } from './project-wizard/packets-step/packets-step.component';
import { ProjectStepComponent } from './project-wizard/project-step/project-step.component';
import { StatisticsStepComponent } from './project-wizard/statistics-step/statistics-step.component';
import { EnrichmentStepComponent } from './project-wizard/enrichment-step/enrichment-step.component';
import { RuleDefinitionComponent } from './project-wizard/rule-definition/rule-definition.component';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { ProjectCardComponent } from './project-card/project-card.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { RouterModule } from '@angular/router';


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
    ProjectDetailComponent
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
    HyperiotComponentsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class ProjectsModule { }
