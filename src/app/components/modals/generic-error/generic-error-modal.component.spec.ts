import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericErrorModalComponent } from './generic-error-modal.component';

describe('GenericErrorModalComponent', () => {
  let component: GenericErrorModalComponent;
  let fixture: ComponentFixture<GenericErrorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericErrorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
