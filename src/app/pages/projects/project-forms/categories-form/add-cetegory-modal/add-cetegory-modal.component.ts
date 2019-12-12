import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { HytModal } from 'src/app/services/hyt-modal';
import { PageStatus } from 'src/app/pages/projects/models/pageStatus';
import { AssetCategory, AssetscategoriesService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'hyt-add-cetegory-modal',
  templateUrl: './add-cetegory-modal.component.html',
  styleUrls: ['./add-cetegory-modal.component.scss']
})
export class AddCetegoryModalComponent extends HytModal implements OnInit {

  pageStatus: PageStatus = PageStatus.Standard;

  categoryForm: FormGroup;

  nameError: string;

  nameValue = '';

  resObserver = {
    next: (res) => {
      this.pageStatus = PageStatus.New;
      this.modalClose.emit(res);
      this.close();
    },
    error: (err) => {
      this.pageStatus = PageStatus.Error;
      this.setErrors(err);
    },
    complete: () => { }
  };

  @Output()
  modalClose: EventEmitter<AssetCategory> = new EventEmitter<AssetCategory>();

  constructor(
    injector: Injector,
    private assetCategoryService: AssetscategoriesService,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();
    //this.nameValue = this.data.category.name;
    // decommenta quando modale è a posto
    this.categoryForm = this.formBuilder.group({});
  }

  submitCategory() {
    this.pageStatus = PageStatus.Loading;
    if (this.data.mode === 'edit') {
      this.assetCategoryService.updateAssetCategory({
        id: this.data.category.id,
        name: this.categoryForm.value.name,
        owner: {
          ownerResourceName: 'it.acsoftware.hyperiot.hproject',
          ownerResourceId: this.data.projectId
        },
        // parent: this.data.category ? this.data.category : null,
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
          break;
        }
        default: {
          //TODO handle generic errors
          this.close();
        }
      }
    } else {
      //TODO handle generic errors
      this.close();
    }
  }

  notValid(): boolean {
    return this.categoryForm.get('name').invalid;
  }

}
