import {  registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'PasswordValidator', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(value: string) {
    // Validation logic for email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  }

  defaultMessage() {
    return 'email must be a valid email address';
  }
}


export function PasswordValidator2(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordValidator,
    });
  };
}