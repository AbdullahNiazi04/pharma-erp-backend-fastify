import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SnakeToCamelInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformToCamelCase(data)));
  }

  private transformToCamelCase(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transformToCamelCase(item));
    }

    if (data instanceof Date) {
      return data;
    }

    if (data && typeof data === 'object' && typeof data.toNumber === 'function') {
      return data.toNumber();
    }


    if (typeof data === 'object') {
      const newObj: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const newKey = key.replace(/([-_][a-z])/g, (group) =>
            group.toUpperCase().replace('-', '').replace('_', ''),
          );
          newObj[newKey] = this.transformToCamelCase(data[key]);
        }
      }
      return newObj;
    }

    return data;
  }
}
