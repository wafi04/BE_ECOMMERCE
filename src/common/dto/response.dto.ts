import { HttpStatus } from "@nestjs/common";

// dto untuk response 
export enum ApiStatusCode {
    // Successful Responses
    SUCCESS = HttpStatus.OK,
    CREATED = HttpStatus.CREATED,
    
    // Client Errors
    BAD_REQUEST = HttpStatus.BAD_REQUEST,
    UNAUTHORIZED = HttpStatus.UNAUTHORIZED,
    FORBIDDEN = HttpStatus.FORBIDDEN,
    NOT_FOUND = HttpStatus.NOT_FOUND,
    
    // Server Errors
    INTERNAL_SERVER_ERROR = HttpStatus.INTERNAL_SERVER_ERROR
}
export class ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
    timestamp: string;

    constructor(statusCode: number, message: string, data?: T) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }
}
