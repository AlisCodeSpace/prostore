'use server'
import { prisma } from "@/db/prisma"
import { convertToPlainObject, formatNumberWithDecimal } from "../utils"
import { LATEST_PRODUCTS_LIMIT } from "../constants"

// Get latest products 
export async function getLatestProducts() {
    const products = await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        take: LATEST_PRODUCTS_LIMIT
    })

    const formattedProducts = products.map((product) => ({
        ...product,
        price: formatNumberWithDecimal(Number(product.price)), 
        rating: Number(product.rating),
    }));
    
    return convertToPlainObject(formattedProducts)
}

// Get single product by its slug
export async function getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
        where: {
            slug
        }
    })
    return convertToPlainObject(product)
}