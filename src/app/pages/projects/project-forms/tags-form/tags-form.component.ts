import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { ProjectFormEntity } from '../project-form-entity';
import { ElementRef } from '@angular/core';
import { AssetTag, AssetstagsService } from '@hyperiot/core';
import { FormGroup } from '@angular/forms';
import { SelectOption, HytModalService } from '@hyperiot/components';
import { Router } from '@angular/router';
import { AddTagModalComponent } from './add-tag-modal/add-tag-modal.component';

export enum TagStatus {
  Default = 0,
  Loaded = 1,
  Error = -1
}

@Component({
  selector: 'hyt-tags-form',
  templateUrl: './tags-form.component.html',
  styleUrls: ['./tags-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TagsFormComponent extends ProjectFormEntity implements OnInit {

  projectId: number;

  tagStatus: TagStatus = TagStatus.Default;

  tags: AssetTag[] = [];

  allTags: AssetTag[] = [];

  // filter/sort logic

  filteredTags: AssetTag[] = [];

  filteringForm: FormGroup;

  sortOptions: SelectOption[] = [
    { value: 'none', label: $localize`:@@HYT_none:None` },
    { value: 'alfabetic-increasing', label: $localize`:@@HYT_a_z:A-Z` },
    { value: 'alfabetic-decreasing', label: $localize`:@@HYT_z_a:Z-A` },
    { value: 'date-increasing', label: $localize`:@@HYT_oldest:Oldest` },
    { value: 'date-decreasing', label: $localize`:@@HYT_newest:Newest` }
  ];

  valueFilter = {
    search: '',
    sort: ''
  };

  constructor(
    injector: Injector,
    private router: Router,
    private assetsTagService: AssetstagsService,
    private modalService: HytModalService
  ) {
    super(injector);
    this.formTemplateId = 'container-tag-form';
    this.formTitle = 'Project Tags';
    this.showSave = false;
    this.hideDelete = true;
    this.projectId = +this.router.url.split('/')[2];
  }

  ngOnInit() {
    this.filteringForm = this.formBuilder.group({});

    this.assetsTagService.findAllAssetTag().subscribe(
      (res: AssetTag[]) => {
        this.allTags = res;
        this.filteredTags = [...this.allTags];
        this.tagStatus = TagStatus.Loaded;
      },
      err => {
        this.tagStatus = TagStatus.Error;
      }
    );
  }

  tagCreated(tag: AssetTag) {
    console.log(tag)
    if (this.allTags.some(t => t.id === tag.id)) {
      this.allTags.find(t => t.id === tag.id).name = tag.name;
    } else {
      this.allTags.push(tag);
    }
    this.search();
  }

  addTagModal() {
    const dialogRef = this.modalService.open(AddTagModalComponent, { mode: 'add', projectId: this.projectId });
    dialogRef.onClosed.subscribe((res: AssetTag) => {
      this.tagCreated(res);
    });
  }

  editTagModal(tag: AssetTag) {
    const dialogRef = this.modalService.open(AddTagModalComponent, { mode: 'edit', projectId: this.projectId, tag });
    dialogRef.onClosed.subscribe((res: AssetTag) => {
      this.tagCreated(res);
    });
  }

  delete(tag: AssetTag): void {
    this.assetsTagService.deleteAssetTag(tag.id).subscribe(
      res => {
        this.allTags = this.allTags.filter(t => t.id !== tag.id);
        this.search();
      },
      err => {
        //TODO error modal
      }
    );
  }

  // filter/sort logic

  onChangeInputSearch() {
    this.valueFilter.search = this.filteringForm.value.textFilter;
    this.search();
  }

  onChangeSelectSort() {
    this.valueFilter.sort = this.filteringForm.value.sort;
    this.sort();
  }

  search() {

    if (this.valueFilter.search && this.valueFilter.search !== '') {
      if (this.valueFilter.search.split('*').length > 18) {
        this.filteredTags = [];
      } else {
        const reg = new RegExp(this.valueFilter.search.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.+').replace(/\?/g, '.'), 'i');
        this.filteredTags = this.allTags.filter(el => (el.name.match(reg)));
        this.sort();
      }
    } else {
      this.filteredTags = [...this.allTags];
      this.sort();
    }

  }

  sort() {
    switch (this.valueFilter.sort) {

      case 'none':
        this.filteredTags.sort((a, b) => {
          if (a.id > b.id) { return -1; }
          if (a.id < b.id) { return 1; }
          return 0;
        });
        break;

      case 'alfabetic-increasing':
        this.filteredTags.sort((a, b) => {
          if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) { return -1; }
          if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) { return 1; }
          return 0;
        });
        break;

      case 'alfabetic-decreasing':
        this.filteredTags.sort((a, b) => {
          if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) { return -1; }
          if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) { return 1; }
          return 0;
        });
        break;

      case 'date-increasing':
        this.filteredTags.sort((a, b) => {
          if (a.id < b.id) { return -1; }
          if (a.id > b.id) { return 1; }
          return 0;
        });
        break;

      case 'date-decreasing':
        this.filteredTags.sort((a, b) => {
          if (a.id > b.id) { return -1; }
          if (a.id < b.id) { return 1; }
          return 0;
        });
        break;

      default:
        break;

    }
  }

}
