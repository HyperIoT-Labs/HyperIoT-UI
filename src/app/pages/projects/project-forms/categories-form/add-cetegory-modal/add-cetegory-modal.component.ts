import { Component, OnInit, AfterViewInit, ViewEncapsulation,ChangeDetectorRef } from '@angular/core';
import { HytModal, HytModalService } from '@hyperiot/components';
import { PageStatus } from 'src/app/pages/projects/models/pageStatus';
import { AssetscategoriesService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpErrorHandlerService } from 'src/app/services/errorHandler/http-error-handler.service';

@Component({
  selector: 'hyt-add-cetegory-modal',
  templateUrl: './add-cetegory-modal.component.html',
  styleUrls: ['./add-cetegory-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddCetegoryModalComponent extends HytModal implements OnInit,AfterViewInit {

  pageStatus: PageStatus = PageStatus.Standard;

  categoryForm: FormGroup;

  nameError: string;

  nameValue = '';

  resObserver = {
    next: (res) => {
      this.pageStatus = PageStatus.New;
      this.close(res);
    },
    error: (err) => {
      this.setErrors(err);
    },
    complete: () => { }
  };

  constructor(
    service: HytModalService,
    private assetCategoryService: AssetscategoriesService,
    private formBuilder: FormBuilder,
    private errorHandler: HttpErrorHandlerService,
    private cd: ChangeDetectorRef
  ) {
    super(service);
  }

  ngOnInit() {
    if (this.data.mode === 'edit') {
      this.nameValue = this.data.category.name;
    }
    this.categoryForm = this.formBuilder.group({});
  }

  ngAfterViewInit(){
    this.cd.detectChanges();
    (
      document.querySelector(
        "#add-category-modal .hyt-input.mat-input-element"
      ) as HTMLElement
    ).focus();
  }

  submitCategory() {
    this.pageStatus = PageStatus.Loading;
    if (this.data.mode === 'edit') {
      this.assetCategoryService.updateAssetCategory({
        id: this.data.category.id,
        name: this.categoryForm.value.name,
        owner: this.data.category.owner,
        entityVersion: this.data.category.entityVersion
      }).subscribe(this.resObserver);
    } else {
      this.assetCategoryService.saveAssetCategory({
        name: this.categoryForm.value.name,
        owner: {
          ownerResourceName: 'it.acsoftware.hyperiot.hproject',
          ownerResourceId: this.data.projectId
        },
        parent: this.data.category ? this.data.category : null,
        entityVersion: 1
      }).subscribe(this.resObserver);
    }
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.nameError = 'Name already taken'; // @I18N@
          this.categoryForm.get('name').setErrors({
            validateInjectedError: {
              valid: false
            }
          });
          this.pageStatus = PageStatus.Error;
          break;
        }
        default: {
          this.nameError = this.errorHandler.handle(err)[0].message;
          this.pageStatus = PageStatus.ErrorGeneric;
        }
      }
    } else {
      this.nameError = this.errorHandler.handle(err)[0].message;
      this.pageStatus = PageStatus.ErrorGeneric;
    }
  }

  notValid(): boolean {
    return this.categoryForm.get('name').invalid;
  }

}
