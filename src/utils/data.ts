// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function seedProducts(products: any[]) {
//   try {
//     // Gunakan transaction untuk memastikan semua operasi dilakukan secara atomic
//     const result = await prisma.$transaction(
//       async (tx) => {
//         // Array untuk menyimpan produk yang berhasil dibuat
//         const createdProducts: string[] = [];

//         // Proses setiap produk dalam transaksi
//         for (const productData of products) {
//           // Cek apakah produk sudah ada
//           const existingProduct = await tx.product.findFirst({
//             where: {
//               name: productData.name,
//               category: productData.category,
//             },
//           });

//           // Jika produk sudah ada, lewati
//           if (existingProduct) {
//             console.log(
//               `Product ${productData.name} already exists. Skipping.`,
//             );
//             continue;
//           }

//           // Buat produk baru dalam transaksi
//           const product = await tx.product.create({
//             data: {
//               name: productData.name,
//               description: productData.description,
//               category: productData.category,
//               color: productData.color,
//               gender: productData.gender, // Asumsi category adalah gender
//               image: productData.image,
//               price: productData.price,
//               sellerId: productData.sellerId,
//               // Buat inventory untuk produk ini
//               Inventory: {
//                 createMany: {
//                   data: productData.inventory.map((inv) => ({
//                     size: inv.size,
//                     quantity: inv.quantity,
//                   })),
//                 },
//               },
//             },
//             include: {
//               Inventory: true,
//             },
//           });

//           // Simpan nama produk yang berhasil dibuat
//           createdProducts.push(product.name);
//           console.log(`Created product: ${product.name}`);
//         }

//         // Kembalikan daftar produk yang berhasil dibuat
//         return createdProducts;
//       },
//       {
//         // Konfigurasi tambahan untuk transaksi
//         maxWait: 5000, // 5 detik maksimal menunggu
//         timeout: 10000, // 10 detik total timeout
//       },
//     );

//     console.log('Seeding complete. Products created:', result);
//   } catch (error) {
//     console.error('Error in product seeding transaction:', error);

//     // Tangani error spesifik
//     if (error instanceof Error) {
//       // Log detail error
//       console.error('Error details:', {
//         message: error.message,
//         stack: error.stack,
//       });
//     }
//   } finally {
//     // Pastikan koneksi Prisma ditutup
//     await prisma.$disconnect();
//   }
// }
