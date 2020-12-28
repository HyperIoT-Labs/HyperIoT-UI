import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDefinitionModalComponent } from './input-definition-modal.component';

describe('InputDefinitionModalComponent', () => {
  let component: InputDefinitionModalComponent;
  let fixture: ComponentFixture<InputDefinitionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputDefinitionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDefinitionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
