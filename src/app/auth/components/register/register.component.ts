import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthSuccessMessageType } from 'src/app/auth/enums/auth-message.enum';
import { AlertType } from 'src/app/shared/enums/alert.enum';
import { PasswordMatchValidator } from 'src/app/shared/providers/password-match-validator';
import { AlertService } from 'src/app/shared/services/alert.service';
import { validationPatterns } from '../../../shared/constants/validation-patterns.constants';
import { IRegisterPayload } from '../../interfaces/register.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../../styles/auth.component.scss'],
})
export class RegisterComponent {
  destroy$ = new Subject();
  isHidden = true;
  isSpinning: boolean = false;

  registerForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(validationPatterns.email),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(validationPatterns.password),
      PasswordMatchValidator.matchValidator('confirmPassword', true),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      PasswordMatchValidator.matchValidator('password'),
    ]),
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
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSpinning = true;

    const formValue = this.registerForm.value;

    const registerPayload: IRegisterPayload = {
      email: formValue.email,
      password: formValue.password,
      returnSecureToken: true,
    };

    this.authService
      .register(registerPayload)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSpinning = false;
          this.alertService.openSnackBar(
            AuthSuccessMessageType.REGISTER_SUCCESS,
            AlertType.SUCCESS
          );
          this.router.navigate(['/']);
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
    return this.registerForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.registerForm.get('password') as FormControl;
  }

  get confirmPassword(): FormControl {
    return this.registerForm.get('confirmPassword') as FormControl;
  }
}
