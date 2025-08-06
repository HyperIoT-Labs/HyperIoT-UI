import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RuleEngineService } from './hyperiot-client/hyt-api/api-module';

@Injectable({
  providedIn: 'root',
})
export class CoreConfig {
  private configReady = new Subject();
  public configReady$ = this.configReady.asObservable();

  public ruleNodes;

  constructor(
    private rulesService: RuleEngineService,
  ) { }

  fetchAvailableOperations() {
    this.rulesService.findAllAvailableOperations().subscribe({
      next: res => {
        this.ruleNodes = res;
        this.configReady.complete();
      },
      error: err => {
        this.configReady.complete();
      },
    });
  }
}
