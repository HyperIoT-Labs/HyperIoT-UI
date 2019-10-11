import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextLabelSettingsComponent } from './text-label-settings.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('TextLabelSettingsComponent', () => {
  let component: TextLabelSettingsComponent;
  let fixture: ComponentFixture<TextLabelSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextLabelSettingsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextLabelSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
