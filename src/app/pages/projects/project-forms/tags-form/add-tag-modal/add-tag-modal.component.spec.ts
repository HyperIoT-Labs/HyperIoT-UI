import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTagModalComponent } from './add-tag-modal.component';

describe('AddTagModalComponent', () => {
  let component: AddTagModalComponent;
  let fixture: ComponentFixture<AddTagModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTagModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTagModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
