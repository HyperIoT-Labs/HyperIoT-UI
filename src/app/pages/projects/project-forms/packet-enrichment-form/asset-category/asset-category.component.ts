import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogService, TreeNodeCategory } from 'components';
import { AssetCategory, AssetscategoriesService, HPacket, HProject } from 'core';
import { Observable, Subscription } from 'rxjs';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { LoadStatus } from 'src/app/models/loadStatus';
import { AddCetegoryModalComponent } from '../../categories-form/add-cetegory-modal/add-cetegory-modal.component';

@Component({
  selector: 'hyt-asset-category',
  templateUrl: './asset-category.component.html',
  styleUrls: ['./asset-category.component.scss']
})
export class AssetCategoryComponent implements OnInit {

  @Input()
  packet: HPacket;

  @Input()
  project: HProject;

  @Input()
  selectedCategories: number[];

  originalCategories = [];

  assetCategories: AssetCategory[];

  categoryStatus: LoadStatus = LoadStatus.Default;

  @Output()
  categoryIds: EventEmitter<number[]> = new EventEmitter<number[]>();

  categoriesFlatTree: TreeNodeCategory[] = [];

  assetRequest: Subscription;

  constructor(
    private assetCategoriesService: AssetscategoriesService,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.getAssetCategories();
  }

  getAssetCategories() {
    this.categoryStatus = LoadStatus.Default;
    if (this.assetRequest) {
      this.assetRequest.unsubscribe();
    }
    this.assetRequest = this.assetCategoriesService.findAllAssetCategory().subscribe(
      (res: AssetCategory[]) => {
        this.assetCategories = [...res];
        this.flatCategories();
        this.categoryStatus = LoadStatus.Loaded;
      },
      err => {
        this.categoryStatus = LoadStatus.Error;
      }
    );
  }

  flatCategories() {
    this.categoriesFlatTree = this.assetCategories.map((d) => ({
      id: d.id,
      label: d.name,
      parent: null,
      children: null,
      data: d,
      active: this.selectedCategories.some(n => n === d.id)
    }));
    this.categoriesFlatTree.forEach(x => {
      x.parent = (x.data.parent) ? this.categoriesFlatTree.find(y => y.id === x.data.parent.id) : null;
      // x.active = this.packet.categoryIds.includes(x.id);
    });
    this.categoriesFlatTree = [...this.categoriesFlatTree];
    this.originalValueUpdate();
  }

  nodeChecked(node: TreeNodeCategory) {
    this.selectedCategories = this.categoriesFlatTree
      .filter(x => x.children.length === 0 && x.active)
      .map(x => x.id);
    this.categoryIds.emit(this.selectedCategories);
  }

  addFunction: (node: TreeNodeCategory) => Observable<TreeNodeCategory> = (node) => {
    return new Observable(sub => {
      const dialogRef = this.dialogService.open(AddCetegoryModalComponent, {
        data: {
          mode: 'add',
          projectId: this.project.id,
          category: node ? node.data : null,
        }
      });
      dialogRef.dialogRef.afterClosed().subscribe((result: AssetCategory) => {
        if (!result) {
          return;
        }
        sub.next({
          id: result.id,
          label: result.name,
          parent: node,
          children: [],
          data: result,
          active: false
        });

        this.getAssetCategories(); // it is necessary refresh categories after adding a new category
        sub.complete();
      });
    });
  }

  removeFunction: (node: TreeNodeCategory) => Observable<TreeNodeCategory> = (node) => {
    return new Observable(sub => {
      const dialogRef = this.dialogService.open(
        DeleteConfirmDialogComponent,
        { data: { title: 'Delete item?', message: 'This operation cannot be undone.' } }
      );
      dialogRef.dialogRef.afterClosed().subscribe((result) => {
        if (result === 'delete') {
          this.assetCategoriesService.deleteAssetCategory(node.id).subscribe(
            res => {
              sub.next(res);
              sub.complete();
            },
            err => {
              sub.error();
            }
          );
        }
      });
    });
  }

  editFunction: (node: TreeNodeCategory) => Observable<TreeNodeCategory> = (node) => {
    return new Observable(sub => {
      const dialogRef = this.dialogService.open(AddCetegoryModalComponent, {
        data: {
          mode: 'edit',
          projectId: this.project.id,
          category: node.data,
        }
      });
      dialogRef.dialogRef.afterClosed().subscribe((result) => {
        if (!result) {
          return;
        }
        sub.next({
          id: node.id,
          label: result.name,
          parent: node.parent,
          children: node.children,
          data: result,
          active: node.active
        });
        sub.complete();
      });
    });
  }

  isDirty(): boolean {
    return this.categoryStatus === 1 ?
      JSON.stringify(this.originalCategories.sort()) !== JSON.stringify(this.selectedCategories.sort()) :
      false;
  }

  originalValueUpdate() {
    this.originalCategories = [...this.selectedCategories];
  }

}
