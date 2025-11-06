import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(
    errors: ValidationError[],
    parentPath = '',
  ): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const error of errors) {
      const path = parentPath ? `${parentPath}.${error.property}` : error.property;

      if (error.constraints) {
        result[path] = Object.values(error.constraints);
      }

      if (error.children && error.children.length > 0) {
        Object.assign(result, this.formatErrors(error.children, path));
      }
    }

    return result;
  }
}
