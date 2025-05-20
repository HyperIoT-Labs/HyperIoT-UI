import { Injectable } from '@angular/core';
import { Area, AreaDevice, HDevice } from 'core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  isArea(obj: Area | AreaDevice | HDevice): obj is Area {
    return (obj as Area).name !== undefined;
  }

  isAreaDevice(obj: Area | AreaDevice | HDevice): obj is AreaDevice {
    const { area, device } = obj as AreaDevice;
    return [area, device].some((attr) => attr !== undefined);
  }

  isHDevice(obj: Area | AreaDevice | HDevice): obj is HDevice {
    return (obj as HDevice).deviceName !== undefined;
  }

}
