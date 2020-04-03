import { Component, OnInit, Injector, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ProjectFormEntity } from '../project-form-entity';
import { TreeNodeCategory, HytModalService } from '@hyperiot/components';
import { AssetscategoriesService, AssetCategory } from '@hyperiot/core';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { Router } from '@angular/router';
import { LoadStatus } from 'src/app/models/loadStatus';
import { Observable } from 'rxjs';
import { AddCetegoryModalComponent } from './add-cetegory-modal/add-cetegory-modal.component';

@Component({
  selector: 'hyt-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss'],
  encapsulation: ViewEncapsulation.None
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
    private router: Router,
    private assetCategoriesService: AssetscategoriesService,
    private modalService: HytModalService,
  ) {
    super(injector);
    this.formTemplateId= 'container-category-form';
    this.formTitle = $localize`:@@HYT_project_categories:Project Categories`;
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

  addFunction: (node: TreeNodeCategory) => Observable<TreeNodeCategory> = (node) => {
    return new Observable(sub => {
      const dialogRef = this.modalService.open(AddCetegoryModalComponent, {
        mode: 'add',
        projectId: this.projectId,
        category: node ? node.data : null
      });
      dialogRef.onClosed.subscribe((result: AssetCategory) => {
        sub.next({
          id: result.id,
          label: result.name,
          parent: node,
          children: [],
          data: result,
          active: false
        });
        sub.complete();
      });
    });
  }

  removeFunction: (node: TreeNodeCategory) => Observable<TreeNodeCategory> = (node) => {
    return new Observable(sub => {
      const dialogRef = this.modalService.open(
        DeleteConfirmDialogComponent,
        { title: $localize`:@@HYT_delete_item:Delete item?`, message: $localize`:@@HYT_operation_cannot_be_undone:This operation cannot be undone.`}
      );
      dialogRef.onClosed.subscribe((result) => {
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
      const dialogRef = this.modalService.open(AddCetegoryModalComponent, {
        mode: 'edit',
        projectId: this.projectId,
        category: node.data
      });
      dialogRef.onClosed.subscribe((result) => {
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

}
