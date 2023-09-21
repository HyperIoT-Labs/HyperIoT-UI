import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HytInputComponent } from './hyt-input/hyt-input.component';
import { DemoMaterialModule } from './material-module';
import { HytButtonComponent } from './hyt-button/hyt-button.component';
import { HytRadioButtonComponent } from './hyt-radio-button/hyt-radio-button.component';
import { HytCheckboxComponent } from './hyt-checkbox/hyt-checkbox.component';
import { HytCardComponent } from './hyt-card/hyt-card.component';
import { HytStepperComponent } from './hyt-stepper/hyt-stepper.component';
import { HytTextAreaComponent } from './hyt-text-area/hyt-text-area.component';
import { HytSelectComponent } from './hyt-select/hyt-select.component';
import { HytTreeViewComponent } from './hyt-tree-view/hyt-tree-view.component';
import { HytInputTemplateComponent } from './hyt-input-template/hyt-input-template.component';
import { HytSelectTemplateComponent } from './hyt-select-template/hyt-select-template.component';
import { HytTreeViewProjectComponent } from './hyt-tree-view-project/hyt-tree-view-project.component';
import { HytTreeViewEditableComponent } from './hyt-tree-view-editable/hyt-tree-view-editable.component';
import { HytModalEComponent } from './hyt-modal-e/hyt-modal-e.component';
import { HytTagComponent } from './hyt-tag/hyt-tag.component';
import { HytTagListComponent } from './hyt-tag-list/hyt-tag-list.component';
import { HytTreeViewCategoryComponent } from './hyt-tree-view-category/hyt-tree-view-category.component';
import { HytAutocompleteComponent } from './hyt-autocomplete/hyt-autocomplete.component';
import { HytTriCheckboxComponent } from './hyt-tri-checkbox/hyt-tri-checkbox.component';
import { HytHexagonComponent } from './hyt-hexagon/hyt-hexagon.component';
import { HytModalContainerComponent } from './hyt-modal/hyt-modal-container.component';
import { HytModalContentDirective } from './hyt-modal/hyt-modal-content.directive';
import { HytDatePickerComponent } from './hyt-date-picker/hyt-date-picker.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { PickerPopUpComponent } from './hyt-date-picker/picker-pop-up/picker-pop-up.component';
import { HytLazyPaginationTableComponent } from './hyt-lazy-pagination-table/hyt-lazy-pagination-table.component';
import { PageInputDirective } from './hyt-lazy-pagination-table/page-input.directive';
import { HytButtonToggleComponent } from './hyt-button-toggle/hyt-button-toggle.component';
import { HytInfiniteScrollingTableComponent } from './hyt-infinite-scrolling-table/hyt-infinite-scrolling-table.component';
import { HytNotificationBoxComponent } from './hyt-notification-box/notification-box.component';
import { HytAccordionGroupComponent } from './hyt-accordion/hyt-accordion-group.component';
import { HytAccordionItem } from './hyt-accordion/hyt-directives/hyt-accordion-item.directive';
import { HytAccordionContent } from './hyt-accordion/hyt-directives/hyt-accordion-content.directive';
import { NotificationService } from './hyt-notification-box/services/notification.service';
import { HytConfirmRecordingActionComponent } from './hyt-modal/hyt-confirm-recording-action/hyt-confirm-recording-action.component';
import { HytGenericMessageDialogComponent } from './hyt-modal/hyt-generic-message-dialog/hyt-generic-message-dialog.component';
import { HytInfoRecordingActionComponent } from './hyt-modal/hyt-info-recording-action/hyt-info-recording-action.component';
import { HytTopologyToolbarComponent } from './hyt-shared-components/hyt-topology-toolbar/hyt-topology-toolbar.component';
import { HytModalService } from './hyt-modal/hyt-modal.service';
import { HytLoginComponent } from './hyt-login/login.component';
import { RouterModule } from '@angular/router';
import { HytInfoComponent } from './hyt-info/hyt-info.component';
import { HytIconButtonComponent } from './hyt-icon-button/hyt-icon-button.component';
import { ConfirmDialogComponent } from './hyt-dialog/confirm-dialog/confirm-dialog.component';
import { InfoDialogComponent } from './hyt-dialog/info-dialog/info-dialog.component';
import { CronEditorComponent } from './cron-editor/cron-editor.component';
import { TimePickerComponent } from './cron-editor/time-picker/time-picker.component';
import { HytInnerFieldSelectComponent } from './hyt-inner-field-select/hyt-inner-field-select.component';
import { DialogContainerComponent } from './hyt-dialog/dialog-container/dialog-container.component';
import { HytDialogDirective, HytDialogContent, HytDialogFooter, HytDialogTitle } from './hyt-dialog/dialog-directives';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = {};

@NgModule({
  declarations: [
    HytInputComponent,
    HytButtonComponent,
    HytRadioButtonComponent,
    HytCheckboxComponent,
    HytCardComponent,
    HytStepperComponent,
    HytTextAreaComponent,
    HytSelectComponent,
    HytTreeViewComponent,
    HytInputTemplateComponent,
    HytSelectTemplateComponent,
    HytTreeViewProjectComponent,
    HytTreeViewEditableComponent,
    HytModalEComponent,
    HytTagComponent,
    HytTagListComponent,
    HytTreeViewCategoryComponent,
    HytAutocompleteComponent,
    HytTriCheckboxComponent,
    HytHexagonComponent,
    HytModalContainerComponent,
    HytModalContentDirective,
    HytDatePickerComponent,
    PickerPopUpComponent,
    HytLazyPaginationTableComponent,
    PageInputDirective,
    HytButtonToggleComponent,
    HytInfiniteScrollingTableComponent,
    HytNotificationBoxComponent,
    HytAccordionGroupComponent,
    HytAccordionItem,
    HytAccordionContent,
    HytConfirmRecordingActionComponent,
    HytGenericMessageDialogComponent,
    HytInfoRecordingActionComponent,
    HytTopologyToolbarComponent,
    HytLoginComponent,
    HytInfoComponent,
    HytInnerFieldSelectComponent,
    HytIconButtonComponent,
    ConfirmDialogComponent,
    InfoDialogComponent,
    CronEditorComponent,
    TimePickerComponent,
    DialogContainerComponent,
    HytDialogDirective,
    HytDialogFooter,
    HytDialogContent,
    HytDialogTitle,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DemoMaterialModule,
    NgxMaskModule.forRoot(options),
    RouterModule,
  ],
  exports: [
    CronEditorComponent,
    HytInputComponent,
    HytButtonComponent,
    HytRadioButtonComponent,
    HytCheckboxComponent,
    HytCardComponent,
    HytStepperComponent,
    HytTextAreaComponent,
    HytSelectComponent,
    HytTreeViewComponent,
    HytTreeViewCategoryComponent,
    HytInputTemplateComponent,
    HytSelectTemplateComponent,
    HytTreeViewProjectComponent,
    HytTreeViewEditableComponent,
    HytTagComponent,
    HytTagListComponent,
    HytModalEComponent,
    HytAutocompleteComponent,
    HytTriCheckboxComponent,
    HytHexagonComponent,
    HytModalContainerComponent,
    HytModalContentDirective,
    HytDatePickerComponent,
    HytLazyPaginationTableComponent,
    HytButtonToggleComponent,
    HytInfiniteScrollingTableComponent,
    HytNotificationBoxComponent,
    HytAccordionGroupComponent,
    HytAccordionItem,
    HytAccordionContent,
    HytConfirmRecordingActionComponent,
    HytGenericMessageDialogComponent,
    HytInfoRecordingActionComponent,
    HytInnerFieldSelectComponent,
    HytTopologyToolbarComponent,
    HytLoginComponent,
    HytInfoComponent,
    HytIconButtonComponent,
    HytDialogDirective,
    HytDialogFooter,
    HytDialogContent,
    HytDialogTitle,
  ],
  providers: [
    NotificationService,
    HytModalService,
  ],
  entryComponents: [
    HytModalContainerComponent,
    HytConfirmRecordingActionComponent,
    HytGenericMessageDialogComponent,
    HytInfoRecordingActionComponent,
  ]
})
export class ComponentsModule { }
