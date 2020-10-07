import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsComponent } from './projects.component';
import { ComponentsModule } from '@hyperiot/components';
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
  MatRippleModule,
  MatTabsModule,
  MatListModule
} from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';

import { CronEditorModule } from 'ngx-cron-editor';

import { StatisticsStepComponent } from './project-wizard/statistics-step/statistics-step.component';
import { WizardReportModalComponent } from './project-wizard/wizard-report-modal/wizard-report-modal.component';
import { WizardOptionsModalComponent } from './project-wizard/wizard-options-modal/wizard-options-modal.component';
import { WizardDeactivationModalComponent } from './project-wizard/wizard-deactivation-modal/wizard-deactivation-modal.component';
import { ApplicationFormComponent } from './project-forms/application-form/application-form.component';
import { RuleErrorModalComponent } from './project-forms/rule-definition/rule-error/rule-error-modal.component';
import { TagsFormComponent } from './project-forms/tags-form/tags-form.component';
import { CategoriesFormComponent } from './project-forms/categories-form/categories-form.component';
import { AddTagModalComponent } from './project-forms/tags-form/add-tag-modal/add-tag-modal.component';
import { AddCetegoryModalComponent } from './project-forms/categories-form/add-cetegory-modal/add-cetegory-modal.component';

import { AreasFormComponent } from './project-forms/areas-form/areas-form.component';
import { AreaMapComponent } from './project-forms/areas-form/area-map/area-map.component';
import { DraggableItemComponent } from './project-forms/areas-form/draggable-item/draggable-item.component';
import { MapDirective } from './project-forms/areas-form/map.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AreaDeviceSelectDialogComponent } from './project-forms/areas-form/area-device-select-dialog/area-device-select-dialog.component';
import { AreaInnerareaSelectDialogComponent } from './project-forms/areas-form/area-innerarea-select-dialog/area-innerarea-select-dialog.component';
import { AreasListComponent } from './project-forms/areas-form/areas-list/areas-list.component';
import { FourierTransformComponent } from './project-forms/packet-enrichment-form/fourier-transform/fourier-transform.component';
import { GenericMessageDialogComponent } from 'src/app/components/modals/generic-message-dialog/generic-message-dialog.component';
import { ProjectStatisticsFormComponent } from './project-forms/project-statistics-form/project-statistics-form.component';
import { StatisticInputDefinitionComponent } from './project-forms/project-statistics-form/statistic-input-definition/statistic-input-definition.component';

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
    PacketEventsFormComponent,
    SelectableTextComponent,
    PacketSelectComponent,
    GenericSummaryListComponent,
    DeviceSelectComponent,
    StatisticsStepComponent,
    WizardReportModalComponent,
    WizardOptionsModalComponent,
    WizardDeactivationModalComponent,
    ApplicationFormComponent,
    RuleErrorModalComponent,
    TagsFormComponent,
    CategoriesFormComponent,
    AddTagModalComponent,
    AddCetegoryModalComponent,
    AreasFormComponent,
    AreaMapComponent,
    DraggableItemComponent,
    MapDirective,
    AreaDeviceSelectDialogComponent,
    AreaInnerareaSelectDialogComponent,
    AreasListComponent,
    FourierTransformComponent,
    GenericMessageDialogComponent,
    ProjectStatisticsFormComponent,
    StatisticInputDefinitionComponent
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatMenuModule,
    CommonModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatChipsModule,
    MatRippleModule,
    MatAutocompleteModule,
    MatInputModule,
    MatExpansionModule,
    DragDropModule,
    MatListModule,
    CronEditorModule
  ],
  entryComponents: [
    AddTagModalComponent,
    AddCetegoryModalComponent,
    DraggableItemComponent,
    AreaDeviceSelectDialogComponent,
    AreaInnerareaSelectDialogComponent,
    GenericMessageDialogComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [ AreasListComponent, AreaMapComponent, DraggableItemComponent, DragDropModule, MatProgressBarModule ]
})
export class ProjectsModule { }
