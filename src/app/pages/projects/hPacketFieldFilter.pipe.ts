import { Pipe, PipeTransform } from '@angular/core';
import { HPacketField } from 'core';

@Pipe({
  name: 'filter'
})
export class HPacketFieldFilterPipe implements PipeTransform {
  transform(items: HPacketField[], searchText: string): any[] {
    if (!items)
        return [];
    if (!searchText)
        return items;
    return items.filter(item => item.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()));
   }
}
