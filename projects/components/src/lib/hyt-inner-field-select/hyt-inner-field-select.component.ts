import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { HPacketField, HPacketFieldsHandlerService } from 'core';

@Component({
  selector: 'hyt-inner-field-select',
  templateUrl: './hyt-inner-field-select.component.html',
  styleUrls: ['./hyt-inner-field-select.component.css']
})
export class HytInnerFieldSelectComponent implements OnChanges, OnInit {

  @Input() fields: HPacketField[] = [];
  @Input() selectedFieldsIds: number[] = [];
  @Input() isMultiSelect = false;

  fieldsOption = [];

  treeControl = new NestedTreeControl<HPacketField>(field => field.innerFields);
  dataSource = new MatTreeNestedDataSource<HPacketField>();

  @Output() fieldSelectionChanged: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor(
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = this.fields;
    const fieldsFlatList = this.hPacketFieldsHandlerService.flatFieldsTree(this.fields);
    this.fieldsOption = fieldsFlatList.map(x => ({
      value: x.field.id,
      label: x.label
    }));
  }

  ngOnInit(): void { }

  hasChild = (_: number, field: HPacketField) => !!field.innerFields && field.innerFields.length > 0;
  isChecked = (field: HPacketField) => this.selectedFieldsIds.some(fId => fId === field.id);
  isDisabled = (field: HPacketField) => {
    if (this.isMultiSelect) {
      return false;
    } else if (this.selectedFieldsIds.length === 0) {
      return false;
    } else if (this.isChecked(field)) {
      return false;
    }
    return true;
  }

  itemSelectToggle(field: HPacketField) {
    if (this.selectedFieldsIds.some(fId => fId === field.id)) {
      this.selectedFieldsIds = this.selectedFieldsIds.filter(fId => fId !== field.id);
    } else {
      this.selectedFieldsIds.push(field.id);
    }
    this.selectedFieldsIds = [...this.selectedFieldsIds];
    this.fieldSelectionChanged.emit(this.selectedFieldsIds);
  }
}
