import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericMessageDialogComponent } from './generic-message-dialog.component';

describe('GenericMessageDialogComponent', () => {
  let component: GenericMessageDialogComponent;
  let fixture: ComponentFixture<GenericMessageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericMessageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
