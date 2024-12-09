# Instalasi dan Konfigurasi Backend Proyek

Dokumen ini menjelaskan langkah-langkah untuk menginstal dan mengonfigurasi backend proyek yang akan dibangun menggunakan framework NestJS.

## Prasyarat

Sebelum memulai, pastikan Anda memiliki hal-hal berikut:

- Node.js dan npm terinstal di sistem Anda.
- Editor teks atau IDE untuk pengembangan.

## Langkah-Langkah Instalasi

1. **Buat Proyek NestJS Baru**:

   - Buka terminal dan jalankan perintah berikut untuk membuat proyek NestJS baru:
     ```bash
     npm install -g @nestjs/cli
     nest new backend
     ```
   - Tunggu proses instalasi selesai.

2. **Instal Dependensi Tambahan**:

   - Masuk ke direktori proyek:
     ```bash
     cd backend-project
     ```
   - Instal paket yang diperlukan:
     ```bash
     yarn add @nestjs/typeorm typeorm pg
     ```
     - `@nestjs/typeorm`: Integrasi TypeORM dengan NestJS
     - `typeorm`: ORM untuk database
     - `pg`: Driver untuk database PostgreSQL

3. **Konfigurasi Database**:

   - Buat koneksi ke database di file `src/prisma/prisma.ts`:

     ```typescript
     import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
     import { PrismaClient } from '@prisma/client';
     @Injectable()
     export class PrismaService
       extends PrismaClient
       implements OnModuleInit, OnModuleDestroy
     {
       constructor() {
         super({
           log: ['query', 'info', 'warn', 'error'],
           datasources: {
             db: {
               url: process.env.DATABASE_URL,
             },
           },
         });
       }

       async onModuleInit() {
         await this.$connect();
       }

       async onModuleDestroy() {
         await this.$disconnect();
       }
     }
     ```

   - Sesuaikan konfigurasi sesuai dengan database Anda.

4. \*_Buat Create_
   \*:

   - Buat entitas untuk memodelkan data produk di `src/products/dto/product.create.ts`:

     ```typescript
     import { Entity, PrimaryGeneratedColumn, Column } from 'class-validator';

     import {
       IsString,
       IsNotEmpty,
       IsOptional,
       IsPositive,
       IsArray,
       ValidateNested,
       IsInt,
     } from 'class-validator';
     import { Type } from 'class-transformer';
     import {
       CreateInventoryDto,
       UpdateInventoryDto,
     } from './create.inventories.dto';
     // type untuk mendefinisikan category tanpa membuat field
     export type CATEGORY = 'RUNNING' | 'JORDAN' | 'BASKETBALL';

     // type untuk gender
     export type GENDER = 'Men' | 'Women';
     // validation untuk product
     export class CreateProductDto {
       @IsString()
       @IsNotEmpty()
       name: string;

       @IsString()
       @IsNotEmpty()
       gender: GENDER;

       @IsString()
       @IsNotEmpty()
       userId: string;

       @IsString()
       @IsNotEmpty()
       category: CATEGORY;

       @IsString()
       @IsNotEmpty()
       description: string;

       @IsString()
       @IsNotEmpty()
       color: string;

       @IsInt()
       @IsPositive()
       price: number;

       @IsString()
       @IsNotEmpty()
       image: string;

       @IsOptional()
       @IsArray()
       @ValidateNested({ each: true }) // Mengaktifkan validasi untuk setiap elemen dalam array
       @Type(() => CreateInventoryDto)
       Inventory?: CreateInventoryDto[];
     }

     // validation untuk product
     // product.dto.ts

     export class UpdateProductDto {
       @IsString()
       @IsOptional()
       name?: string;

       @IsString()
       @IsOptional()
       gender?: GENDER;

       @IsString()
       @IsOptional()
       userId?: string;

       @IsString()
       @IsOptional()
       category?: CATEGORY;

       @IsString()
       @IsOptional()
       description?: string;

       @IsString()
       @IsOptional()
       color?: string;

       @IsInt()
       @IsOptional()
       @IsPositive()
       price?: number;

       @IsString()
       @IsOptional()
       image?: string;

       @IsOptional()
       @IsArray()
       @ValidateNested({ each: true })
       @Type(() => CreateInventoryDto)
       Inventory: CreateInventoryDto[]; // Ganti nama properti
     }
     ```

5. **Buat Module, Controller, dan Service**:

   - Buat modul, kontroler, dan layanan untuk produk:
     ```bash
     nest generate module products
     nest generate controller products
     nest generate service products
     ```
   - Implementasikan logika CRUD untuk produk di `src/products/products.service.ts` dan `src/products/products.controller.ts`.

6. **Tambahkan Autentikasi dan Otorisasi**:

   - Instal paket yang diperlukan untuk autentikasi:
     ```bash
     npm install @nestjs/jwt @nestjs/passport passport passport-local
     ```
   - Buat modul, kontroler, dan layanan untuk autentikasi.
   - Implementasikan logika autentikasi dan otorisasi.

7. **Jalankan Aplikasi**:
   - Jalankan aplikasi backend dengan perintah:
     ```bash
     npm run start:dev
     ```

Selesei ! Proyek anda telah berhasil untuk diconfigurasi dan siap untuk digunakan

Proyek ini menyediakan untuk backend yang sudah digunakan
