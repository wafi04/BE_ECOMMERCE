// export enum STATUS_CODE_RESPONSE {
//   SUCCESS = 200,
//   BAD_REQUEST = 400,
//   UNAUTHORIZED = 401,
//   INTERNAL_SERVER_ERROR = 500,
// }

// export interface ApiResponse<T> {
//   statusCode: number;
//   success: boolean;
//   message: string;
//   data?: T | null;
//   error?: string | null;
//   timestamp?: string;
// }

// export class ResponseUtil {
//   /**
//    * Membuat response sukses
//    * @param data Data yang akan dikembalikan
//    * @param message Pesan sukses
//    * @param statusCode Status kode (default 200)
//    * @returns ApiResponse
//    */
//   static success<T>(
//     data: T,
//     message: string = 'Success',
//     statusCode: number = STATUS_CODE_RESPONSE.SUCCESS,
//   ): ApiResponse<T> {
//     return {
//       statusCode,
//       success: true,
//       message,
//       data,
//       error: null,
//       timestamp: new Date().toISOString(),
//     };
//   }

//   /**
//    * Membuat response error
//    * @param message Pesan error
//    * @param statusCode Status kode error
//    * @param error Detail error (opsional)
//    * @returns ApiResponse
//    */
//   static error(
//     message: string,
//     statusCode: number = STATUS_CODE_RESPONSE.INTERNAL_SERVER_ERROR,
//     error: string | null = null,
//   ): ApiResponse<null> {
//     return {
//       statusCode,
//       success: false,
//       message,
//       data: null,
//       error: error || message,
//       timestamp: new Date().toISOString(),
//     };
//   }

//   /**
//    * Membuat response bad request
//    * @param message Pesan error
//    * @param errors Detail error validasi
//    * @returns ApiResponse
//    */
//   static badRequest(
//     message: string = 'Bad Request',
//     errors?: any[],
//   ): ApiResponse<null> {
//     return {
//       statusCode: STATUS_CODE_RESPONSE.BAD_REQUEST,
//       success: false,
//       message,
//       data: null,
//       error: errors ? JSON.stringify(errors) : message,
//       timestamp: new Date().toISOString(),
//     };
//   }

//   /**
//    * Membuat response unauthorized
//    * @param message Pesan error
//    * @returns ApiResponse
//    */
//   static unauthorized(message: string = 'Unauthorized'): ApiResponse<null> {
//     return {
//       statusCode: STATUS_CODE_RESPONSE.UNAUTHORIZED,
//       success: false,
//       message,
//       data: null,
//       error: message,
//       timestamp: new Date().toISOString(),
//     };
//   }
// }
