import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RulesService } from './hyperiot-client/rule-client/api-module/api/rules.service';

@Injectable({
  providedIn: 'root',
})
export class CoreConfig {
  private configReady = new Subject();
  public configReady$ = this.configReady.asObservable();

  public ruleNodes;

  constructor(
    private rulesService: RulesService,
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