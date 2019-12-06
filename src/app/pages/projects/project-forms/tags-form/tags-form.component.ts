import { Component, OnInit, Injector, ViewChild, Input } from '@angular/core';
import { ProjectFormEntity } from '../project-form-entity';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { ElementRef } from '@angular/core';
import { AssetTag, AssetstagsService, HProject } from '@hyperiot/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { Output } from '@angular/core';
import { EventEmitter } from 'events';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

export enum TagStatus {
  Default = 0,
  Loaded = 1,
  Error = -1
}

@Component({
  selector: 'hyt-tags-form',
  templateUrl: './tags-form.component.html',
  styleUrls: ['./tags-form.component.scss']
})
export class TagsFormComponent extends ProjectFormEntity implements OnInit {

  @Input() project: HProject;
  
  @Output() tagIds: EventEmitter = new EventEmitter();

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;

  tagStatus: TagStatus = TagStatus.Default;

  tagCtrl = new FormControl();

  tags: AssetTag[] = [];

  allTags: AssetTag[] = [];

  tagChoice: AssetTag[] = [];

  filteredTags: Observable<AssetTag[]>;

  hideDelete = true;

  showSave = false;

  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private i18n: I18n,
    private assetsTagService: AssetstagsService,
  ) {
    super(injector, i18n, formView);
    this.formTitle = 'Project Tags';
  }

  ngOnInit() {
    this.assetsTagService.findAllAssetTag().subscribe(
      res => {
        this.allTags = res;
        this.tagChoice = [...this.allTags];
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((ser: string | null) => ser ? this._filter(ser) : this.tagChoice.slice()));
        this.tagStatus = TagStatus.Loaded;
      },
      err => {
        this.tagStatus = TagStatus.Error;
      }
    );
  }

  remove(tag: AssetTag): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
      if (this.allTags.find(x => x.name === tag.name)) {
        this.tagChoice.push(tag);
        this.tagCtrl.setValue(null);
      }
      this.outTags();
    }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      let assetTag: AssetTag;
      if (this.tags.find(x => x.name === event.value))
        return;
      else if (this.allTags.some(x => x.name === event.value)) {
        assetTag = this.allTags.find(x => x.name === event.value);
        this.selected({ option: { value: assetTag } });
      } else {
        assetTag = {
          name: event.value,
          owner: {
            ownerResourceName: 'it.acsoftware.hyperiot.hproject',
            ownerResourceId: this.project.id
          },
          entityVersion: 1
        };
        this.assetsTagService.saveAssetTag(assetTag).subscribe(
          res => {
            this.allTags.push(res);
            this.tags.push(res);
            this.outTags();
          },
          err => { }
        );
      }
    }
    if (input) {
      input.value = '';
    }
    this.tagCtrl.setValue(null);
  }


  selected(event): void {
    this.tags.push(event.option.value);
    for (let k = 0; k < this.tagChoice.length; k++) {
      if (this.tagChoice[k].name === event.option.value.name) {
        this.tagChoice.splice(k, 1);
      }
    }
    this.outTags();
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string | AssetTag): AssetTag[] {
    const filterValue: string = (typeof value === 'string') ? value.toLowerCase() : value.name.toLowerCase();
    return this.tagChoice.filter(tag => tag.name.toLowerCase().includes(filterValue));
  }

  outTags() {
    //  this.tagIds.emit(this.tags.map(t => t.id));
  }

}
