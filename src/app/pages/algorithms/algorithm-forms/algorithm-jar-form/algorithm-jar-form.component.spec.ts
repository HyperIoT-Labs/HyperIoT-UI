import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmJarFormComponent } from './algorithm-jar-form.component';

describe('AlgorithmJarFormComponent', () => {
  let component: AlgorithmJarFormComponent;
  let fixture: ComponentFixture<AlgorithmJarFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgorithmJarFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgorithmJarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
