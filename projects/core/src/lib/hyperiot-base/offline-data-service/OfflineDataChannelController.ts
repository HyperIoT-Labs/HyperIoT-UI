import { BehaviorSubject } from 'rxjs';

export class OfflineDataChannelController {
  $totalCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  channelLowerBound: number = 0;
}
