import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HProject, AssetscategoriesService, AssetCategory, AssetTag } from '@hyperiot/core';
import { TreeNodeCategory } from '@hyperiot/components';

export interface Pac {
  id: number
  parent: number
  children: number[]
  data: any
}

@Component({
  selector: 'hyt-asset-category',
  templateUrl: './asset-category.component.html',
  styleUrls: ['./asset-category.component.scss']
})
export class AssetCategoryComponent implements OnInit {

  @Input() project: HProject;

  @Output() categoryIds: EventEmitter<number[]> = new EventEmitter<number[]>();

  treeCategory: TreeNodeCategory[] = [];

  constructor(
    private assetCategoriesService: AssetscategoriesService
  ) { }

  ngOnInit() {
    this.assetCategoriesService.findAllAssetCategory().subscribe(
      res => {
        this.categories = res;
        this.createTreeCategory(null);
      }
    )
  }

  categories: AssetCategory[] = []
  pac: Pac[] = [];

  createTreeCategory(node: TreeNodeCategory) {
    this.categories.forEach(x => {
      this.pac.push({
        id: x.id,
        parent: (x.parent) ? x.parent.id : null,
        children: this.categories.filter(a => a.parent.id == x.id).map(a => a.id),
        data: x
      })
    })
    // for (let i = 0; i < this.categories.length; i++) {

    //   let node: TreeNodeCategory = {
    //     label: this.categories[i].name,
    //     data: this.categories[i],
    //     active: false,
    //     children: []
    //   }

    //   if (!node && !this.categories[i].parent) {
    //     this.treeCategory.push(node);
    //     this.createTreeCategory(node);
    //   }

    //   else if (this.categories[i].parent.id == node.data.id) {
    //     node.children.push(node);
    //     this.createTreeCategory(node);
    //   }
    // }

  }

  catIds: number[] = [];

  fillCatIds(categories: TreeNodeCategory[]) {
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].children.length == 0)
        if (categories[i].active)
          this.catIds.push(categories[i].data.id);
        else this.fillCatIds(categories[i].children);
    }
  }

  cbChange(event) {
    this.catIds = [];
    this.fillCatIds(this.treeCategory);
    this.categoryIds.emit(this.catIds);
  }

  cbAdd(event) {
    console.log(event)
    let data: AssetTag = {
      entityVersion: 1,
      name: event.label,
      owner: {
        ownerResourceName: 'it.acsoftware.hyperiot.hproject',
        ownerResourceId: this.project.id
      }
    }

    this.assetCategoriesService.saveAssetCategory(data).subscribe(
      res => event.data = res,
      err => console.log(err)
    )
  }

}
