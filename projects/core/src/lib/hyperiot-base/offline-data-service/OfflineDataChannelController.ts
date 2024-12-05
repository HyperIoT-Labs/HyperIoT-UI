import { BehaviorSubject, Subscription } from 'rxjs';

export class OfflineDataChannelController {
  $totalCount: BehaviorSubject<number>;
  channelLowerBound: number = 0;
  dataSubscription: Subscription;

  constructor(initialCount: number = 0) {
    this.$totalCount = new BehaviorSubject<number>(initialCount);
  }
}
