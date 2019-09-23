import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTagComponent } from './asset-tag.component';

describe('AssetTagComponent', () => {
  let component: AssetTagComponent;
  let fixture: ComponentFixture<AssetTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetTagComponent ]
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
