import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AssetscategoriesService, AssetCategory, HPacket, HProject } from '@hyperiot/core';
import { TreeNodeCategory } from '@hyperiot/components';
import { LoadStatus } from 'src/app/models/loadStatus';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';

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

  constructor(
    private assetCategoriesService: AssetscategoriesService,
    private dialog: MatDialog,
    private modalService: HytModalConfService
  ) { }

  ngOnInit() {
    this.assetCategoriesService.findAllAssetCategory().subscribe(
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

  // addFunction: (node: TreeNodeCategory) => Observable<TreeNodeCategory> = (node) => {
  // return new Observable(sub => {
  //   const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
  //     data: { title: 'Delete item?', message: 'This operation cannot be undone.' }
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result === 'delete') {
  //       this.assetCategoriesService.deleteAssetCategory(node.id).subscribe(
  //         res => {
  //           sub.next(res);
  //           sub.complete();
  //         },
  //         err => {
  //           sub.error();
  //         }
  //       );
  //     }
  //   });
  // });
  // }

  removeFunction: (node: TreeNodeCategory) => Observable<TreeNodeCategory> = (node) => {
    return new Observable(sub => {
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: { title: 'Delete item?', message: 'This operation cannot be undone.' }
      });
      dialogRef.afterClosed().subscribe((result) => {
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

  // editFunction: (node: TreeNodeCategory) => Observable<TreeNodeCategory> = (node) => {
  // return new Observable(sub => {
  //   const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
  //     data: { title: 'Delete item?', message: 'This operation cannot be undone.' }
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result === 'delete') {
  //       this.assetCategoriesService.deleteAssetCategory(node.id).subscribe(
  //         res => {
  //           sub.next(res);
  //           sub.complete();
  //         },
  //         err => {
  //           sub.error();
  //         }
  //       );
  //     }
  //   });
  // });
  // }

  isDirty(): boolean {
    return this.assetCategories ? JSON.stringify(this.originalCategories.sort()) !== JSON.stringify(this.selectedCategories.sort()) : false;
  }

  originalValueUpdate() {
    this.originalCategories = [...this.selectedCategories];
  }

}
