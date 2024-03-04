import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionTargetComponent } from './production-target.component';

describe('ProductionTargetComponent', () => {
  let component: ProductionTargetComponent;
  let fixture: ComponentFixture<ProductionTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductionTargetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
