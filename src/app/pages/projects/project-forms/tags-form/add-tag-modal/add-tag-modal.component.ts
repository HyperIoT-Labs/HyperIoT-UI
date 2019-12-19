import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HytModal, HytModalService } from '@hyperiot/components';
import { PageStatus } from 'src/app/pages/projects/models/pageStatus';
import { AssetstagsService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpErrorHandlerService } from 'src/app/services/errorHandler/http-error-handler.service';

@Component({
  selector: 'hyt-add-tag-modal',
  templateUrl: './add-tag-modal.component.html',
  styleUrls: ['./add-tag-modal.component.scss']
})
export class AddTagModalComponent extends HytModal implements OnInit, AfterViewInit {

  pageStatus: PageStatus = PageStatus.Standard;

  tagForm: FormGroup;

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
    private assetTagService: AssetstagsService,
    private formBuilder: FormBuilder,
    private errorHandler: HttpErrorHandlerService
  ) {
    super(service);
  }

  ngOnInit() {
    if (this.data.mode === 'edit') {
      this.nameValue = this.data.tag.name;
    }
    this.tagForm = this.formBuilder.group({});
  }

  ngAfterViewInit(): void {
    setTimeout(() => {

      (document.querySelector('#add-tag-modal .hyt-input.mat-input-element') as HTMLElement).focus();

    }, 0);
  }

  submitTag() {
    this.pageStatus = PageStatus.Loading;
    if (this.data.tag) {
      this.assetTagService.updateAssetTag({
        id: this.data.tag.id,
        owner: this.data.tag.owner,
        name: this.tagForm.value.name,
        entityVersion: this.data.tag.entityVersion
      }).subscribe(this.resObserver);
    } else {
      this.assetTagService.saveAssetTag({
        name: this.tagForm.value.name,
        owner: {
          ownerResourceName: 'it.acsoftware.hyperiot.hproject',
          ownerResourceId: this.data.projectId
        },
        entityVersion: 1
      }).subscribe(this.resObserver);
    }
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.nameError = 'Name already taken'; // @I18N@
          this.tagForm.get('name').setErrors({
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
    return this.tagForm.get('name').invalid;
  }

}
