import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTagComponent } from './asset-tag.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('AssetTagComponent', () => {
  let component: AssetTagComponent;
  let fixture: ComponentFixture<AssetTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetTagComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
