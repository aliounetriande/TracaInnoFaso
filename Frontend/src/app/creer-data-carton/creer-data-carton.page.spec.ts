import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreerDataCartonPage } from './creer-data-carton.page';

describe('CreerDataCartonPage', () => {
  let component: CreerDataCartonPage;
  let fixture: ComponentFixture<CreerDataCartonPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreerDataCartonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
