import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
    localStorage.clear();
  });

  it('should save and retrieve data from localStorage', () => {

    const key = 'myKey';
    const value = 'myValue';


    service.saveData(key, value);
    const retrievedValue = service.getData(key);


    expect(retrievedValue).toBe(value);
  });

  it('should remove data from localStorage', () => {

    const key = 'myKey';
    const value = 'myValue';
    service.saveData(key, value);


    service.removeData(key);
    const retrievedValue = service.getData(key);


    expect(retrievedValue).toBeNull();
  });

  it('should clear all data from localStorage', () => {

    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';
    service.saveData(key1, value1);
    service.saveData(key2, value2);


    service.clearData();
    const retrievedValue1 = service.getData(key1);
    const retrievedValue2 = service.getData(key2);


    expect(retrievedValue1).toBeNull();
    expect(retrievedValue2).toBeNull();
  });
});

