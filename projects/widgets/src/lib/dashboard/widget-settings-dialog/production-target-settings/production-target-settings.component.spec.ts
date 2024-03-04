import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionTargetSettingsComponent } from './production-target-settings.component';

describe('ProductionTargetSettingsComponent', () => {
  let component: ProductionTargetSettingsComponent;
  let fixture: ComponentFixture<ProductionTargetSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductionTargetSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionTargetSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
