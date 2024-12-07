import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map(data => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;

                // Menentukan pesan berdasarkan status code
                let message = this.getMessageByStatusCode(statusCode);

                return new ApiResponse(statusCode, message, data);
            }),
        );
    }

    private getMessageByStatusCode(statusCode: number): string {
        switch (statusCode) {
            // Successful Responses
            case HttpStatus.OK:
                return 'Request processed successfully';
            case HttpStatus.CREATED:
                return 'Resource created successfully';
            case HttpStatus.ACCEPTED:
                return 'Request accepted for processing';
            
            // Client Error Responses
            case HttpStatus.BAD_REQUEST:
                return 'Bad Request: Invalid input or parameters';
            case HttpStatus.UNAUTHORIZED:
                return 'Unauthorized: Authentication required';
            case HttpStatus.FORBIDDEN:
                return 'Forbidden: You do not have permission';
            case HttpStatus.NOT_FOUND:
                return 'Not Found: Resource does not exist';
            case HttpStatus.CONFLICT:
                return 'Conflict: Resource already exists';
            
            // Server Error Responses
            case HttpStatus.INTERNAL_SERVER_ERROR:
                return 'Internal Server Error: Something went wrong';
            case HttpStatus.BAD_GATEWAY:
                return 'Bad Gateway: Invalid response from upstream server';
            case HttpStatus.SERVICE_UNAVAILABLE:
                return 'Service Unavailable: Server is temporarily unable to handle the request';
            
            // CRUD Specific Responses
            case 200: // Generic OK for updates
                return 'Resource updated successfully';
            case 204: // No Content (successful update/delete)
                return 'Resource successfully modified';
            
            // Default case
            default:
                return 'Request processed';
        }
    }
}