import { Component, OnInit, Injector, ViewChild, ElementRef } from '@angular/core';
import { ProjectFormEntity } from '../project-form-entity';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { TreeNodeCategory, CategoryTreeEvent } from '@hyperiot/components/public-api';
import { AssetscategoriesService, AssetCategory } from '@hyperiot/core';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';
import { Router } from '@angular/router';
import { LoadStatus } from 'src/app/models/loadStatus';

@Component({
  selector: 'hyt-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss']
})
export class CategoriesFormComponent extends ProjectFormEntity implements OnInit {

  projectId: number;

  categoryStatus: LoadStatus = LoadStatus.Default;

  assetCategories: AssetCategory[] = [];

  categoriesFlatTree: TreeNodeCategory[] = [];

  hideDelete = true;

  showSave = false;

  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private i18n: I18n,
    private router: Router,
    private assetCategoriesService: AssetscategoriesService,
    private modalService: HytModalConfService
  ) {
    super(injector, i18n, formView);
    this.formTitle = 'Project Categories';
    this.hideDelete = true;
    this.showSave = false;
    this.projectId = +this.router.url.split('/')[2];
  }

  flatCategories() {
    this.categoriesFlatTree = this.assetCategories.map((d) => ({
      id: d.id,
      label: d.name,
      parent: null,
      children: null,
      data: d,
      active: false
    }));
    this.categoriesFlatTree.forEach(x => {
      x.parent = (x.data.parent) ? this.categoriesFlatTree.find(y => y.id === x.data.parent.id) : null;
      // x.active = this.packet.categoryIds.includes(x.id);
    });
    this.categoriesFlatTree = [...this.categoriesFlatTree];
  }

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

  treeAction(event: CategoryTreeEvent) {
    switch (event.action) {
      case 'add':
        this.openCategoryModal((event.node) ? event.node.data : null, 'add');
        break;
      case 'delete':
        this.openDelete(event.node.id);
        break;
      case 'edit':
        this.openCategoryModal(event.node.data, 'edit');
        break;
    }
  }

  categoryCreated(category: AssetCategory) {
    if (this.assetCategories.some(t => t.id === category.id)) {
      this.assetCategories.find(t => t.id === category.id).name = category.name;
    } else {
      this.assetCategories.push(category);
    }
    this.flatCategories();
  }

  openCategoryModal(category: AssetCategory, mode: string) {
    this.modalService.open('hyt-add-cetegory-modal', { projectId: this.projectId, category, mode });
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
