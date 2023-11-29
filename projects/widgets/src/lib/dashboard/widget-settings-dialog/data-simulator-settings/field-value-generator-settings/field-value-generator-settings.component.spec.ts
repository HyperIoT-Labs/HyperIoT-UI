import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldValueGeneratorSettingsComponent } from './field-value-generator-settings.component';

describe('FieldValueGeneratorSettingsComponent', () => {
  let component: FieldValueGeneratorSettingsComponent;
  let fixture: ComponentFixture<FieldValueGeneratorSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldValueGeneratorSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldValueGeneratorSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
