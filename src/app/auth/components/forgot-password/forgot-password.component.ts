import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthSuccessMessageType } from 'src/app/auth/enums/auth-message.enum';
import { AlertType } from 'src/app/shared/enums/alert.enum';
import { RouteType } from 'src/app/shared/enums/route.enum';
import { AlertService } from 'src/app/shared/services/alert.service';
import { RequestType } from '../../enums/request.enum';
import { IResetPasswordPayload } from '../../interfaces/reset-password.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../../styles/auth.component.scss'],
})
export class ForgotPasswordComponent {
  destroy$ = new Subject();
  isHidden: boolean = true;
  isSpinning: boolean = false;
  requestType: string = RequestType.PASSWORD_RESET;

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {}

  onDestroy(): void {
    this.destroy$.next(void 0);
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSpinning = true;

    const formValue = this.forgotPasswordForm.value;

    const forgotPasswordPayload: IResetPasswordPayload = {
      requestType: this.requestType,
      email: formValue.email,
    };

    this.authService
      .forgotPassword(forgotPasswordPayload)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSpinning = false;
          console.log(response);
          this.alertService.openSnackBar(
            AuthSuccessMessageType.RESET_EMAIL_SENT_SUCCESS,
            AlertType.SUCCESS
          );
          this.router.navigate([RouteType.LOGIN]);
        },
        error: (err) => {
          this.isSpinning = false;
          this.alertService.openSnackBar(
            err.error.error.message,
            AlertType.ERROR
          );
        },
        complete: () => {
          console.info('COMPLETE:', 'Completed!');
        },
      });
  }

  get email(): FormControl {
    return this.forgotPasswordForm.get('email') as FormControl;
  }
}
