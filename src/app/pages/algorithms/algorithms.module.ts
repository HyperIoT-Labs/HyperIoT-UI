import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '@hyperiot/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AlgorithmsComponent } from './algorithms.component';
import { AlgorithmCardComponent } from './algorithm-card/algorithm-card.component';
import { AlgorithmInfoFormComponent } from './algorithm-forms/algorithm-info-form/algorithm-info-form.component';
import { AlgorithmWizardComponent } from './algorithm-wizard/algorithm-wizard.component';

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
import { OutputFieldsFormComponent } from './algorithm-forms/output-fields-form/output-fields-form.component';
import { AlgorithmJarFormComponent } from './algorithm-forms/algorithm-jar-form/algorithm-jar-form.component';
import { AlgorithmWizardReportModalComponent } from './algorithm-wizard/algorithm-wizard-report-modal/algorithm-wizard-report-modal.component';

@NgModule({
  declarations: [
    AlgorithmsComponent,
    AlgorithmCardComponent,
    AlgorithmInfoFormComponent,
    AlgorithmWizardComponent,
    OutputFieldsFormComponent,
    AlgorithmJarFormComponent,
    AlgorithmWizardReportModalComponent
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
    MatListModule
  ]
})
export class AlgorithmsModule { }
