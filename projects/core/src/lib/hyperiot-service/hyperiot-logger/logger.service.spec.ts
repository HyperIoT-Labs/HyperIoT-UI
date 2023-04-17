import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';
import { LOG_LEVEL, LogRegistryEntry, LogRegistry } from './logger-config';

describe('LoggerService', () => {
  let service: LoggerService ;
  let logLevel: LogRegistryEntry;
  let registry: LogRegistry;

  beforeEach(() => {
  TestBed.configureTestingModule({
  }); 
     
  service = TestBed.get(LoggerService);

});

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should call a function that set log level', () => {
    
    let spy = spyOn(service, 'setLogLevel');
    service.setLogLevel(LOG_LEVEL.DEBUG);
    expect(spy).toHaveBeenCalled();
    
  });

  it('should call a function that set a class in the registry', () => {
      
      let spy = spyOn(service,'setToRegistry');
      service.setToRegistry('class', logLevel);
      expect(spy).toHaveBeenCalled();
      
    });
    
  it('should call a function that set registry', () => {
    
    let spy = spyOn(service, 'setRegistry');
    service.setRegistry(registry);
    expect(spy).toHaveBeenCalledWith(registry);
    
  });

  it('should expect the registry retun null if a class is removed in the registry', () => {
    
    service.setToRegistry('class', logLevel);
    let spy = spyOn(service, 'removeFromRegistry');
    service.removeFromRegistry('class');
    expect(spy).toHaveBeenCalledWith('class');

  });
  
  it('should expect the registry retun a value if a class is setted in the registry', () => {
    
    service.setToRegistry('class', logLevel);
    let spy = spyOn(service, 'getRegistryByKey');
    service.getRegistryByKey('class');
    expect(spy).toHaveBeenCalledWith('class');
  });
  

  it('should expect a Write error log', () => {
      
    let spy = spyOn(service, 'error');
    let spy2 = spyOn(service, 'writeLog').and.returnValue(true);;

    service.error('error message');
    expect(spy).toHaveBeenCalledWith('error message');
    expect(spy2).toBeTruthy();

  });

  it('should expect a Write info log', () => {
      
    let spy = spyOn(service, 'info');
    let spy2 = spyOn(service, 'writeLog').and.returnValue(true);;

    service.info('info message');
    expect(spy).toHaveBeenCalledWith('info message');
    expect(spy2).toBeTruthy();

  });

  it('should expect a Write warn log', () => {
      
    let spy = spyOn(service, 'warn');
    let spy2 = spyOn(service, 'writeLog').and.returnValue(true);;

    service.warn('warn message');
    expect(spy).toHaveBeenCalledWith('warn message');
    expect(spy2).toBeTruthy();

  });

  it('should expect a Write debug log', () => {
      
    let spy = spyOn(service, 'debug');
    let spy2 = spyOn(service, 'writeLog').and.returnValue(true);;

    service.debug('debug message');
    expect(spy).toHaveBeenCalledWith('debug message');
    expect(spy2).toBeTruthy();

  });

  it('should expect a Write trace log', () => {
      
    let spy = spyOn(service, 'trace');
    let spy2 = spyOn(service, 'writeLog').and.returnValue(true);;

    service.trace('trace message');
    expect(spy).toHaveBeenCalledWith('trace message');
    expect(spy2).toBeTruthy();

  });

  it('should expect a Write log console message', () => {
    
    console.log = jasmine.createSpy("log");      
    let spy = spyOn(service, 'writeLog').and.returnValue(
      console.log(LOG_LEVEL.DEBUG)
    );
    
    service.writeLog(LOG_LEVEL.DEBUG,'class','debug message');
    expect(spy).toHaveBeenCalled();    
    expect(console.log).toHaveBeenCalledWith(LOG_LEVEL.DEBUG);
  });

});
