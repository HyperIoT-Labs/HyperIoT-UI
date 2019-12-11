import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { HytModal } from 'src/app/services/hyt-modal';
import { PageStatus } from 'src/app/pages/projects/models/pageStatus';
import { AssetTag, AssetstagsService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'hyt-add-tag-modal',
  templateUrl: './add-tag-modal.component.html',
  styleUrls: ['./add-tag-modal.component.scss']
})
export class AddTagModalComponent extends HytModal implements OnInit {

  pageStatus: PageStatus = PageStatus.Standard;

  tagForm: FormGroup;

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
  modalClose: EventEmitter<AssetTag> = new EventEmitter<AssetTag>();

  constructor(
    injector: Injector,
    private assetTagService: AssetstagsService,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();
    //this.nameValue = this.data.tag.name;
    // decommenta quando modale è a posto
    this.tagForm = this.formBuilder.group({});
  }

  submitTag() {
    this.pageStatus = PageStatus.Loading;
    if (this.data.tag) {
      this.assetTagService.updateAssetTag({
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
    return this.tagForm.get('name').invalid;
  }

}
