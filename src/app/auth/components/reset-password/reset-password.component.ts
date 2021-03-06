import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { validationPatterns } from 'src/app/shared/constants/validation-patterns.constants';
import { AlertType } from 'src/app/shared/enums/alert.enum';
import { RouteType } from 'src/app/shared/enums/route.enum';
import { PasswordMatchValidator } from 'src/app/shared/providers/password-match-validator';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthSuccessMessageType } from '../../enums/auth-message.enum';
import { IResetPasswordPayload } from '../../interfaces/reset-password.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../../styles/auth.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  destroy$ = new Subject();
  isHidden: boolean = true;
  isSpinning: boolean = false;
  oobCode: string | undefined;

  resetPasswordForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(validationPatterns.password),
      PasswordMatchValidator.matchValidator('confirmPassword', true),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(validationPatterns.password),
      PasswordMatchValidator.matchValidator('password'),
    ]),
  });

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParams['oobCode'];
  }

  onDestroy(): void {
    this.destroy$.next(void 0);
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSpinning = true;

    const formValue = this.resetPasswordForm.value;

    const resetPasswordPayload: IResetPasswordPayload = {
      oobCode: this.oobCode,
      newPassword: formValue.password,
    };

    this.authService
      .resetPassword(resetPasswordPayload)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSpinning = false;
          this.alertService.openSnackBar(
            AuthSuccessMessageType.RESET_PASSWORD_SUCCESS,
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

  get password(): FormControl {
    return this.resetPasswordForm.get('password') as FormControl;
  }

  get confirmPassword(): FormControl {
    return this.resetPasswordForm.get('confirmPassword') as FormControl;
  }
}
