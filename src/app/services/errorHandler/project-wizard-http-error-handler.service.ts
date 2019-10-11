import { Injectable } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HYTError } from './models/models';

@Injectable({
  providedIn: 'root'
})
export class ProjectWizardHttpErrorHandlerService extends HttpErrorHandlerService {

  constructor(i18n: I18n) {
    super(i18n);
  }

  handleCreateHProject(httpError: HttpErrorResponse): HYTError[] {

    switch (httpError.status) {
      case 422: {
        return [
          {
            message: 'Esiste già un progetto con lo stesso nome',
            container: 'general'
          },
          {
            message: 'unavailable project name',
            container: 'projectName'
          },
        ];
        break;
      }
      default: {
        return this.handle(httpError);
      }
    }

  }

  handleCreateHDevice(httpError: HttpErrorResponse): HYTError[] {
    switch (httpError.status) {
      case 422: {
        switch (httpError.error.type) {
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
            return [
              {
                message: httpError.error.errorMessages[0] + ' ' + this.i18n('HYT_duplicate_entity'),
                container: 'hdevice-devicename'
              },
              {
                message: httpError.error.errorMessages[0] + ' ' + this.i18n('HYT_duplicate_entity'),
                container: 'general'
              }
            ];
            break;
          }
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTScreenNameAlreadyExistsException': {
            return [
              {
                message: 'This name is already used by another device',
                container: 'hdevice-devicename'
              },
              {
                message: 'The device name is already used by another device',
                container: 'general'
              }
            ];
            break;
          }
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
            var errors: HYTError[] = [];
            errors.length
            for (let k of httpError.error.validationErrors)
              errors.push({ message: k.message, container: k.field })
            errors.push({ message: 'alcuni campi inseriti sono invalidi', container: 'general' })
            return errors;
            break;
          }
          default: {
            return [
              {
                message: this.i18n('HYT_unknown_error'),
                container: 'general'
              }
            ];
          }
        }
        break;
      }
      default: {
        return this.handle(httpError);
      }
    }
  }

  handleCreatePacket(httpError: HttpErrorResponse): HYTError[] {
    switch (httpError.status) {
      case 422: {
        switch (httpError.error.type) {
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
            return [
              {
                message: httpError.error.errorMessages[0] + ' ' + this.i18n('HYT_duplicate_entity'),
                container: 'packetName'
              },
              {
                message: 'Un pacchetto con lo stesso nome esiste già in questo Device',
                container: 'general'
              }
            ];
            break;
          }
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
            var errors: HYTError[] = [];
            errors.length
            for (let k of httpError.error.validationErrors)
              errors.push({ message: k.message, container: k.field })
            errors.push({ message: 'alcuni campi inseriti sono invalidi', container: 'general' })
            return errors;
            break;
          }
          default: {
            return [
              {
                message: this.i18n('HYT_unknown_error'),
                container: 'general'
              }
            ];
          }
        }
        break;
      }
      default: {
        return this.handle(httpError);
      }
    }
  }

  handleCreateField(httpError: HttpErrorResponse): HYTError[] {
    switch (httpError.status) {
      case 422: {
        switch (httpError.error.type) {
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
            return [
              {
                message: 'field name ' + this.i18n('HYT_duplicate_entity'),
                container: 'fieldName'
              },
              {
                message: 'Un campo con lo stesso nome esiste già nella stessa posizione',
                container: 'general'
              }
            ];
            break;
          }
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
            var errors: HYTError[] = [];
            errors.length
            for (let k of httpError.error.validationErrors)
              errors.push({ message: k.message, container: k.field });
            errors.push({ message: 'Alcuni campi inseriti sono invalidi', container: 'general' });
            return errors;
            break;
          }
          default: {
            return [
              {
                message: this.i18n('HYT_unknown_error'),
                container: 'general'
              }
            ];
          }
        }
        break;
      }
      default: {
        return this.handle(httpError);
      }
    }
  }

  handleCreateRule(httpError: HttpErrorResponse): HYTError[] {
    switch (httpError.status) {
      case 422: {
        switch (httpError.error.type) {
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
            return [
              {
                message: 'Name ' + this.i18n('HYT_duplicate_entity'),
                container: 'rule-name'
              },
              {
                message: 'Una regola con lo stesso nome esiste già',
                container: 'general'
              }
            ];
            break;
          }
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
            var errors: HYTError[] = [];
            errors.length
            for (let k of httpError.error.validationErrors)
              errors.push({ message: k.message, container: k.field });
            errors.push({ message: 'Alcuni campi inseriti sono invalidi', container: 'general' });
            return errors;
            break;
          }
          default: {
            return [
              {
                message: this.i18n('HYT_unknown_error'),
                container: 'general'
              }
            ];
          }
        }
        break;
      }
      default: {
        return this.handle(httpError);
      }
    }
  }

}
