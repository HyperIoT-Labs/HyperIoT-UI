import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCetegoryModalComponent } from './add-cetegory-modal.component';

describe('AddCetegoryModalComponent', () => {
  let component: AddCetegoryModalComponent;
  let fixture: ComponentFixture<AddCetegoryModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCetegoryModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCetegoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
