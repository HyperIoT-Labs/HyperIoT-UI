import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrichmentTipColumnComponent } from './enrichment-tip-column.component';

describe('EnrichmentTipColumnComponent', () => {
  let component: EnrichmentTipColumnComponent;
  let fixture: ComponentFixture<EnrichmentTipColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrichmentTipColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrichmentTipColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
