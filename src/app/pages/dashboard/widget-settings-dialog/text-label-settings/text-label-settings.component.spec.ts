import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextLabelSettingsComponent } from './text-label-settings.component';

describe('TextLabelSettingsComponent', () => {
  let component: TextLabelSettingsComponent;
  let fixture: ComponentFixture<TextLabelSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextLabelSettingsComponent ]
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
