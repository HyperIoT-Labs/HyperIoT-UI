import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicMapUserConfiguratorComponent } from './dynamic-map-user-configurator.component';

describe('DynamicMapUserConfiguratorComponent', () => {
  let component: DynamicMapUserConfiguratorComponent;
  let fixture: ComponentFixture<DynamicMapUserConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicMapUserConfiguratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicMapUserConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
