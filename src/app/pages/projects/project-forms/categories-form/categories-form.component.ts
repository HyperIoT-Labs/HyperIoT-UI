import { Component, OnInit, Injector, ViewChild, ElementRef } from '@angular/core';
import { ProjectFormEntity } from '../project-form-entity';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { TreeNodeCategory } from '@hyperiot/components/public-api';
import { AssetscategoriesService, AssetCategory } from '@hyperiot/core';

@Component({
  selector: 'hyt-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss']
})
export class CategoriesFormComponent extends ProjectFormEntity implements OnInit {

  categoriesFlatTree: TreeNodeCategory[] = [];

  constructor(
    injector: Injector,
    private assetCategoriesService: AssetscategoriesService,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private i18n: I18n
  ) {
    super(injector, i18n, formView);
    this.longDefinition = 'Lorem ipsum...';
    this.formTitle = 'Project Categories';
    this.icon = this.entitiesService.packet.icon;
  }

  ngOnInit() {
    this.assetCategoriesService.findAllAssetCategory().subscribe(
      (res: AssetCategory[]) => {
        res.forEach(x => {
          this.categoriesFlatTree.push({
            id: x.id,
            label: x.name,
            parent: null,
            children: [],
            data: x,
            active: false
          });
        });
        this.categoriesFlatTree.forEach(x => {
          x.parent = (x.data.parent) ? this.categoriesFlatTree.find(y => y.id === x.data.parent.id) : null;
          // x.active = this.packet.categoryIds.includes(x.id);
        });
        this.categoriesFlatTree = [...this.categoriesFlatTree];
      }
    );

  }

  cbChange(event) {

  }

  cbAdd(event) {

  }

}
