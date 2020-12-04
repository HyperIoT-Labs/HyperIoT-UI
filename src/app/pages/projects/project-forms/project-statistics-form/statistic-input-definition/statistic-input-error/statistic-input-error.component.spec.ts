import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticInputErrorComponent } from './statistic-input-error.component';

describe('StatisticInputErrorComponent', () => {
  let component: StatisticInputErrorComponent;
  let fixture: ComponentFixture<StatisticInputErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticInputErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticInputErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
