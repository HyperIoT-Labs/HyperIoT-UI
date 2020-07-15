import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDataSettingsComponent } from './image-data-settings.component';

describe('ImageDataSettingsComponent', () => {
  let component: ImageDataSettingsComponent;
  let fixture: ComponentFixture<ImageDataSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageDataSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageDataSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
