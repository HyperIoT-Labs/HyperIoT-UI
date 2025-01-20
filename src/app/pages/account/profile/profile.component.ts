import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HusersService, HUser, HdevicesService, AreasService, HprojectsService, BrandingService, BrandingActions, BrandingSelectors, Dashboard, UserSiteSettingActions, UserSiteSettingSelectors } from 'core';
import { AuthenticationHttpErrorHandlerService } from '../../../services/errorHandler/authentication-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { Router } from '@angular/router';
import { HyperiotLogoMobilePath, HyperiotLogoPath } from 'src/app/constants';
import { forkJoin, map, take, } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatCheckboxChange } from '@angular/material/checkbox';

const { OFFLINE, REALTIME } = Dashboard.DashboardTypeEnum;

@Component({
  selector: 'hyt-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {

  errors: HYTError[] = [];

  /**
   * Flag to display Company Section
   */
  isCompany = false;

  /**
   * This field is used as a flag to make the form buttons clickable
   */
  loading = false;

  personalInfoForm: FormGroup;
  changePasswordForm: FormGroup;

  initialBrandingForm: FormGroup;
  brandingForm: FormGroup;

  defaultDashboardSettings: FormGroup;

  generalError = 0;

  exception = false;
  errorMessage: string[] = [];

  fieldError = new Map();

  /**
   * This variable is used as a flag to make a success message appear when updating personal information goes well.
   */
  personalInfoUpdated = false;

  /**
   * This variable is used as a flag to make a success message appear when changing password goes well.
   */
  passwordChanged = false;

  /**
   * This variable is used as a flag to make an alert appear when an error occurs.
   */
  wentWrong = false;

  /**
   * This variable contains the string to display in case of error while trying to update personal information or change password.
   */
  errMsg = $localize`:@@HYT_generic_error:Something went wrong`;

  /**
   * This variable contains the string to display when the personal information update is successful.
   */
  successMsg = $localize`:@@HYT_user_updated:Personal information updated correctly`;

  /**
   * This variable contains the string to display when the password change is successful.
   */
  succesMsgPwd = $localize`:@@HYT_password_changed:Password changed correctly`;

  // TODO... implement or remove error logic in single fields
  error: any;

  /**
   * This variable is used to hold account informations of the user logged in.
   */
  user: HUser;

  /**
   * This variable hold the specific field of the ID for the user logged in.
   */
  userId: number;

  /**
   * This variable contains the user input for the password to change.
   */
  oldPassword: string;

  /**
   * This variable contains the user input for the new password.
   */
  newPassword: string;

  /**
   * This variable contains the user input for the new password; entering the new password twice is a confirmation step.
   */
  confirmPassword: string;

  platformCounters = {
    projects: '',
    areas: '',
    devices: '',
  };

  initialLogoPath;
  initialLogoMobilePath;
  logoPath;
  logoMobilePath;

  fileToUpload: File | null = null;

  logoErrorMessage = {
    showError: false,
    message: ''
  };

  get isBrandedTheme() {
    return this.brandingService.isBrandedTheme;
  }

  get canNotSaveTheme() {
    if (this.brandingService.isBrandedTheme) {
      return !this.fileToUpload && !this.brandingForm.dirty;
    } else {
      return !this.fileToUpload;
    }
  }

  get colorSchemaChanged() {
    return JSON.stringify(this.initialBrandingForm.value) != JSON.stringify(this.brandingForm.value);
  }

  /**
   * This is the constructor of the class.
   */
  constructor(
    private hUserService: HusersService,
    private fb: FormBuilder,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private hDevicesService: HdevicesService,
    private areasService: AreasService,
    private hProjectService: HprojectsService,
    private brandingService: BrandingService,
    private store: Store
  ) {
  }

  /**
   * This is an angular lifecycle hook that executes certain operations on initialization of the application.
   */
  ngOnInit(): void {
    this.personalInfoForm = this.fb.group({});

    this.changePasswordForm = this.fb.group({});

    this.brandingForm = this.fb.group({
      primaryColor: [''],
      secondaryColor: [''],
    });

    this.store.select(UserSiteSettingSelectors.selectUserSiteSetting)
      .pipe(
        take(1)
      )
      .subscribe(({
        defaultProjectsDashboardDataSource,
        defaultAreasDashboardDataSource,
      }) => {
        const fromDataSource = (value: Dashboard.DashboardTypeEnum) => value === REALTIME;

        this.defaultDashboardSettings = this.fb.group({
          defaultProjectsDashboardDataSource: fromDataSource(defaultProjectsDashboardDataSource),
          defaultAreasDashboardDataSource: fromDataSource(defaultAreasDashboardDataSource)
        })
      });

    const toDataSource = (value: boolean) => value ? REALTIME : OFFLINE;

    this.defaultDashboardSettings.controls.defaultProjectsDashboardDataSource.valueChanges
      .subscribe((defaultProjectsDashboardDataSource) => {
        this.store.dispatch(
          UserSiteSettingActions.updatePartialSettings({
            userSiteSetting: {
              defaultProjectsDashboardDataSource: toDataSource(defaultProjectsDashboardDataSource),
            }
          })
        );
      });

    this.defaultDashboardSettings.controls.defaultAreasDashboardDataSource.valueChanges
      .subscribe((defaultAreasDashboardDataSource) => {
        this.store.dispatch(
          UserSiteSettingActions.updatePartialSettings({
            userSiteSetting: {
              defaultAreasDashboardDataSource: toDataSource(defaultAreasDashboardDataSource),
            }
          })
        );
      });

    if (localStorage.getItem('user') !== null) {
      this.user = JSON.parse(localStorage.getItem('user'));
      this.userId = this.user.id;
      this.cd.detectChanges();
      this.personalInfoForm.get("username").setValue(this.user.username);
      this.personalInfoForm.get("username").disable();
    } else {
      this.router.navigate(['/auth/login']);
    }

    this.loadGeneralData();
  }

  /**
   * This method gets the information entered by the user from the form, sends it as an object of type HUser to the back-end and handles
   * possibleerrors.
   */
  updatePersonalInfo(): void {
    this.loading = true;
    const modifiedUser: HUser = {
      id: this.user.id,
      username: this.personalInfoForm.get('username').value,
      email: this.personalInfoForm.get('email').value,
      name: this.personalInfoForm.get('name').value,
      lastname: this.personalInfoForm.get('lastname').value,
      entityVersion: this.user.entityVersion
    };

    this.hUserService
      .updateAccountInfo(modifiedUser)
      .toPromise()
      .then(
        (res) => {
          this.user = res;
          localStorage.setItem("user", JSON.stringify(res));
          this.personalInfoUpdated = true;
          this.loading = false;
          this.personalInfoUpdated = false;
        },
        (err) => {
          // TODO handle errors
          this.errors = this.httperrorHandler.handle(err);
          this.loading = false;
          this.personalInfoUpdated = false;
        }
      );
  }

  /**
   * This method gets the information entered by the user in the 'change password' form, sends it to the back-end and handles possible
   * errors.
   */
  updatePassword(): void {
    this.loading = true;
    this.oldPassword = this.changePasswordForm.value.oldPassword;
    this.newPassword = this.changePasswordForm.value.newPassword;
    this.confirmPassword = this.changePasswordForm.value.confirmPassword;

    this.hUserService.changeHUserPassword(this.userId, this.oldPassword, this.newPassword, this.confirmPassword).subscribe(
      res => {
        this.passwordChanged = true;
        this.loading = false;
      },
      err => {
        this.errors = this.httperrorHandler.handle(err);
        this.loading = false;
        this.passwordChanged = false;
        this.wentWrong = true;
        this.changePasswordForm.reset();
      }
    );
  }

  keyDownFunction(event): void {
    if (event.keyCode === 13) {
      this.updatePersonalInfo();
      this.updatePassword();
    }
  }

  /**
   * This method performs the form control on input elements for the "personal information" form and returns the status of the elements
   */
  notValidPif(): boolean {
    return (
      this.personalInfoForm.get('username').invalid ||
      this.personalInfoForm.get('email').invalid ||
      this.personalInfoForm.get('name').invalid ||
      this.personalInfoForm.get('lastname').invalid
    );
  }

  /**
   * This method performs the form control on input elements for the "change password" form and returns the status of the elements
   */
  notValidCpf(): boolean {
    return (
      this.changePasswordForm.get('oldPassword').invalid ||
      this.changePasswordForm.get('newPassword').invalid ||
      this.changePasswordForm.get('confirmPassword').invalid
    );
  }

  initUpload() {
    let fileInput = document.getElementById('logo-file-input');
    if (fileInput)
      fileInput.click();
    else
      console.error('ERROR: cannot find file input');
  }

  handleLogoInput(files: FileList) {
    this.logoErrorMessage = {
      showError: false,
      message: ''
    };
    const file = files.item(0);
    this.fileToUpload = file;
    let reader = new FileReader();
    reader.onload = (event: any) => {
      this.logoPath = event.target.result;
      this.logoMobilePath = event.target.result;
    }
    reader.readAsDataURL(file);
  }

  resetLogo(logoFileInput) {
    this.logoPath = this.initialLogoPath;
    this.logoMobilePath = this.initialLogoMobilePath;
    this.fileToUpload = null;
    logoFileInput.value = null;
  }

  resetColorSchema() {
    this.brandingForm.patchValue(this.initialBrandingForm.value);
    this.brandingForm.markAsUntouched();
    this.brandingForm.markAsPristine();
  }

  restoreDefaultTheme(logoFileInput) {
    this.logoErrorMessage = {
      showError: false,
      message: ''
    };
    if (this.brandingService.isBrandedTheme) {
      this.store.dispatch(BrandingActions.reset());
    } else {
      this.logoPath = HyperiotLogoPath;
      this.logoMobilePath = HyperiotLogoMobilePath;
      this.fileToUpload = null;
      logoFileInput.value = null;
      this.resetColorSchema();
    }

  }

  saveTheme() {
    this.logoErrorMessage = {
      showError: false,
      message: ''
    };

    const colorSchema = this.brandingForm.value;

    if (this.fileToUpload) {
      this.store.dispatch(BrandingActions.updateAll({
        brandingTheme: {
          file: this.fileToUpload,
          fileBase64: this.logoPath,
          colorSchema,
        }
      }));
    } else {
      this.store.dispatch(BrandingActions.updateAll({
        brandingTheme: {
          fileBase64: this.logoPath,
          colorSchema,
        }
      }));

    }

  }

  loadGeneralData() {
    forkJoin({
      projects: this.hProjectService.findAllHProjectPaginated(1).pipe(map(res => res.numPages)),
      areas: this.areasService.findAllAreaPaginated(1).pipe(map(res => res.numPages)),
      devices: this.hDevicesService.findAllHDevicePaginated(1).pipe(map(res => res.numPages))
    }).subscribe({
      next: (value) => {
        this.platformCounters = value;
      }
    });

    this.brandingService.logoPath$.subscribe({
      next: ({ standard, mobile }) => {
        this.initialLogoPath = standard;
        this.initialLogoMobilePath = mobile;
        this.logoPath = standard;
        this.logoMobilePath = mobile;
        this.fileToUpload = null;
        (document.getElementById('logo-file-input') as HTMLInputElement).value = null;
      },
    });

    this.store.select(BrandingSelectors.selectThemeColorSchema).subscribe({
      next: (colorSchema) => {
        this.initialBrandingForm = this.fb.group({
          primaryColor: [colorSchema.primaryColor],
          secondaryColor: [colorSchema.secondaryColor],
        });
        this.resetColorSchema();
      }
    });

    this.store.select(BrandingSelectors.selectError).subscribe({
      next: (error) => {
        switch (error?.action) {
          case BrandingActions.updateFailure.type:
            this.logoErrorMessage = {
              showError: true,
              message: $localize`:@@HYT_saving_branding_theme_error:Saving branding theme error`
            };
            break;
          case BrandingActions.resetFailure.type:
            this.logoErrorMessage = {
              showError: true,
              message: $localize`:@@HYT_restoring_default_theme_error:Restoring default theme error`
            };
            break;
        }
      }
    });
  }

}
