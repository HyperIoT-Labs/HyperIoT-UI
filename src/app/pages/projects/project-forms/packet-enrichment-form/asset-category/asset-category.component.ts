import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AssetscategoriesService, AssetCategory, HPacket, HProject } from '@hyperiot/core';
import { TreeNodeCategory, CategoryTreeEvent } from '@hyperiot/components';
import { LoadStatus } from 'src/app/models/loadStatus';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'hyt-asset-category',
  templateUrl: './asset-category.component.html',
  styleUrls: ['./asset-category.component.scss']
})
export class AssetCategoryComponent implements OnInit {

  @Input() packet: HPacket;

  @Input() project: HProject;

  assetCategories: AssetCategory[] = [];

  categoryStatus: LoadStatus = LoadStatus.Default;

  @Output() categoryIds: EventEmitter<number[]> = new EventEmitter<number[]>();

  categoriesFlatTree: TreeNodeCategory[] = [];

  catIds: number[] = [];

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
      active: this.catIds.some(n => n === d.id)
    }));
    this.categoriesFlatTree.forEach(x => {
      x.parent = (x.data.parent) ? this.categoriesFlatTree.find(y => y.id === x.data.parent.id) : null;
      // x.active = this.packet.categoryIds.includes(x.id);
    });
    this.categoriesFlatTree = [...this.categoriesFlatTree];
  }

  fillCatIds() {
    this.catIds = this.categoriesFlatTree
      .filter(x => x.children.length === 0 && x.active)
      .map(x => x.id);
    console.log(this.catIds);
  }

  treeAction(event: CategoryTreeEvent) {
    switch (event.action) {
      case 'add':
        this.openCategoryModal((event.node) ? event.node.data : null, 'add');
        break;
      case 'delete':
        this.openDelete(event.node.id);
        break;
      case 'checked':
        this.cbChange();
        break;
      case 'edit':
        this.openCategoryModal(event.node.data, 'edit');
        break;
    }
  }

  openCategoryModal(category: AssetCategory, mode: string) {
    this.modalService.open('hyt-add-cetegory-modal', { projectId: this.project.id, category, mode });
  }

  cbChange() {
    this.fillCatIds();
    this.categoryIds.emit(this.catIds);
  }

  categoryCreated(category: AssetCategory) {
    if (this.assetCategories.some(t => t.id === category.id)) {
      this.assetCategories.find(t => t.id === category.id).name = category.name;
    } else {
      this.assetCategories.push(category);
    }
    this.flatCategories();
  }

  removeCategoryAndChildren(categoryId: number) {
    this.assetCategories.filter(t => (t.parent) ? t.parent.id === categoryId : false).forEach(element => {
      this.removeCategoryAndChildren(element.id);
    });
    this.assetCategories = this.assetCategories.filter(t => t.id !== categoryId);
  }

  private openDelete(id: number) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { title: 'Delete item?', message: 'This operation cannot be undone.' }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.assetCategoriesService.deleteAssetCategory(id).subscribe(
          res => {
            this.removeCategoryAndChildren(id);
            this.flatCategories();
          },
          err => {
            //TODO handle error
          }
        );
      }
    });
  }

}
