import { BehaviorSubject, Subscription } from 'rxjs';

export class OfflineDataChannelController {
  $totalCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  channelLowerBound: number = 0;
  dataSubscription: Subscription;
}
