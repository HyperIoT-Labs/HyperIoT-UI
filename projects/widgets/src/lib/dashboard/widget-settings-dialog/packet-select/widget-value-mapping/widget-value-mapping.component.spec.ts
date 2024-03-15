import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetValueMappingComponent } from './widget-value-mapping.component';

describe('WidgetValueMappingComponent', () => {
  let component: WidgetValueMappingComponent;
  let fixture: ComponentFixture<WidgetValueMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WidgetValueMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetValueMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
