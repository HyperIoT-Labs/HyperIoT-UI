import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticInputDefinitionComponent } from './statistic-input-definition.component';

describe('StatisticInputDefinitionComponent', () => {
  let component: StatisticInputDefinitionComponent;
  let fixture: ComponentFixture<StatisticInputDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticInputDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticInputDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
