import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AssetscategoriesService, AssetCategory, HPacket } from '@hyperiot/core';
import { TreeNodeCategory } from '@hyperiot/components';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-asset-category',
  templateUrl: './asset-category.component.html',
  styleUrls: ['./asset-category.component.scss']
})
export class AssetCategoryComponent implements OnInit {

  @Input() packet: HPacket;

  @Output() categoryIds: EventEmitter<number[]> = new EventEmitter<number[]>();

  categoriesFlatTree: TreeNodeCategory[] = [];

  constructor(
    private wizardService: ProjectWizardService,
    private assetCategoriesService: AssetscategoriesService
  ) { }

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
          })
        })
        this.categoriesFlatTree.forEach(x => {
          x.parent = (x.data.parent) ? this.categoriesFlatTree.find(y => y.id == x.data.parent.id) : null;
          // x.active = this.packet.categoryIds.includes(x.id);
        })
        this.categoriesFlatTree = [...this.categoriesFlatTree];
      }
    )
  }

  catIds: number[] = [];

  fillCatIds() {
    this.catIds = [];
    this.categoriesFlatTree.forEach(x => {
      if (x.children.length == 0 && x.active)
        this.catIds.push(x.id);
    })
  }

  cbChange(event) {
    this.fillCatIds();
    this.categoryIds.emit(this.catIds);
  }

  cbAdd(event) {
    let data: AssetCategory = {
      entityVersion: 1,
      name: event.label,
      owner: {
        ownerResourceName: 'it.acsoftware.hyperiot.hproject',
        ownerResourceId: this.wizardService.getHProject().id
      },
      parent: event.parent ? event.parent.data : null
    }

    this.assetCategoriesService.saveAssetCategory(data).subscribe(
      (res: AssetCategory) => {
        this.categoriesFlatTree.push({
          id: res.id,
          label: res.name,
          parent: event.parent,
          children: [],
          data: res,
          active: false
        })
        this.categoriesFlatTree = [...this.categoriesFlatTree];
      },
      err => console.log(err)
    )
  }

}
