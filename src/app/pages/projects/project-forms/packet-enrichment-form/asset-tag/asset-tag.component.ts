import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
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

  @Input() project: HProject;

  selectedTags: number[] = [];

  tagStatus: TagStatus = TagStatus.Default;

  tagCtrl = new FormControl();
  filteredTags: Observable<AssetTag[]>;
  tags: AssetTag[] = [];
  allTags: AssetTag[] = [];
  tagChoice: AssetTag[] = [];

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;

  @Output() tagIds: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor(
    private assetsTagService: AssetstagsService,
  ) { }

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
    this.tagIds.emit(this.tags.map(t => t.id));
  }

}
