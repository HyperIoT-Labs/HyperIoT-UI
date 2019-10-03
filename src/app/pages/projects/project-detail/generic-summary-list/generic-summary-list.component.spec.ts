import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericSummaryListComponent } from './generic-summary-list.component';

describe('GenericSummaryListComponent', () => {
  let component: GenericSummaryListComponent;
  let fixture: ComponentFixture<GenericSummaryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericSummaryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
