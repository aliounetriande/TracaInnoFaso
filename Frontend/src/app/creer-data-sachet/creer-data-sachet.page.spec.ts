import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreerDataSachetPage } from './creer-data-sachet.page';

describe('CreerDataSachetPage', () => {
  let component: CreerDataSachetPage;
  let fixture: ComponentFixture<CreerDataSachetPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreerDataSachetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
