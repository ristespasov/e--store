export enum AuthErrorMessageType {
  EmailExists = 'EMAIL_EXISTS',
  OperationNotAlowed = 'OPERATION_NOT_ALLOWED',
  TooManyAttemptsTryLater = 'TOO_MANY_ATTEMPTS_TRY_LATER',
  EmailNotFound = 'EMAIL_NOT_FOUND',
  InvalidPassword = 'INVALID_PASSWORD',
  UserDisabled = 'USER_DISABLED',
}

export enum AuthSuccessMessageType {
  RegisterSuccess = 'Success! Your account has been created.',
  LoginSuccess = 'Successfully logged in.',
}