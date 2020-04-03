import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AssetTag, AssetstagsService, HProject } from '@hyperiot/core';
import { MatChipInputEvent } from '@angular/material';
import { startWith, map } from 'rxjs/operators';

export enum TagStatus {
  Default = 0,
  Loaded = 1,
  Error = -1
}

@Component({
  selector: 'hyt-asset-tag',
  templateUrl: './asset-tag.component.html',
  styleUrls: ['./asset-tag.component.scss']
})
export class AssetTagComponent implements OnInit {

  @Input()
  project: HProject;

  @Input()
  selectedTags: number[];

  originalTags = [];

  tagStatus: TagStatus = TagStatus.Default;

  tagCtrl = new FormControl();
  filteredTags: Observable<AssetTag[]>;
  tags: AssetTag[] = [];
  allTags: AssetTag[];
  tagChoice: AssetTag[] = [];

  @ViewChild('tagInput')
  tagInput: ElementRef<HTMLInputElement>;

  assetRequest: Subscription;

  constructor(
    private assetsTagService: AssetstagsService,
  ) { }

  ngOnInit() {
    this.getAssetTags();
  }

  getAssetTags() {
    this.tagStatus = TagStatus.Default;
    if (this.assetRequest) {
      this.assetRequest.unsubscribe();
    }
    this.assetsTagService.findAllAssetTag().subscribe(
      res => {
        this.allTags = res;
        this.tagChoice = [...this.allTags];
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((ser: string | null) => ser ? this._filter(ser) : this.tagChoice.slice()));
        this.fill();
        this.tagStatus = TagStatus.Loaded;
      },
      err => {
        this.tagStatus = TagStatus.Error;
      }
    );
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      let assetTag: AssetTag;
      if (this.tags.find(x => x.name === event.value)) {
        return;
      } else if (this.allTags.some(x => x.name === event.value)) {
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

  remove(tag: AssetTag): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
      if (this.allTags.find(x => x.name === tag.name)) {
        this.tagChoice.push(tag);
        this.tagCtrl.setValue(null);
      }
      this.selectedTags = this.tags.map(t => t.id);
    }
  }

  selected(event): void {
    this.tags.push(event.option.value);
    this.selectedTags = this.tags.map(t => t.id);
    this.tagChoice = this.allTags.filter(x => !this.selectedTags.some(y => y === x.id));
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string | AssetTag): AssetTag[] {
    const filterValue: string = (typeof value === 'string') ? value.toLowerCase() : value.name.toLowerCase();
    return this.tagChoice.filter(tag => tag.name.toLowerCase().includes(filterValue));
  }

  isDirty(): boolean {
    return this.tagStatus === 1 ? JSON.stringify(this.originalTags.sort()) !== JSON.stringify(this.selectedTags.sort()) : false;
  }

  originalValueUpdate() {
    this.originalTags = [...this.selectedTags];
  }

  fill() {
    this.tags = this.allTags.filter(x => this.selectedTags.some(y => y === x.id));
    this.selectedTags = this.tags.map(t => t.id);
    this.tagChoice = this.allTags.filter(x => !this.selectedTags.some(y => y === x.id));
    this.tagCtrl.setValue(null);
    this.originalValueUpdate();
  }

}
