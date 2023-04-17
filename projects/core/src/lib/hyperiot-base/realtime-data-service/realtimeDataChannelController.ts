import { Subject, Observable, merge, bufferToggle, mergeMap, filter } from 'rxjs';
import { PacketDataChunk } from '../models/packet-data';

export class RealtimeDataChannelController {
  private isPaused: boolean;

  private play$: Subject<any> = new Subject<any>();
  private pause$: Subject<any> = new Subject<any>();

  dataStreamOutput$: Observable<PacketDataChunk>;
  dataStreamInput$: Subject<PacketDataChunk> = new Subject<PacketDataChunk>();

  constructor() {
    this.dataStreamOutput$ = merge(
      // pause
      this.dataStreamInput$.pipe(
        bufferToggle(this.pause$, () => this.play$),
        mergeMap((x) => x)
      ),
      // play
      this.dataStreamInput$.pipe(filter((x) => !this.isPaused))
    );
    this.play();
  }

  public play() {
    if (!this.isPaused) {
      return;
    }
    this.isPaused = false;
    this.play$.next(true);
  }
  public pause() {
    if (this.isPaused) {
      return;
    }
    this.isPaused = true;
    this.pause$.next(true);
  }
}
