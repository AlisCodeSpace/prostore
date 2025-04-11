'use server'

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
    const itemsPrice = round2(
        items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice)

    return {
        itemsPrice: itemsPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
    }
}

export async function addItemToCart(data: CartItem) {
    try {
        const sessionCartId =(await cookies()).get("sessionCartId")?.value;

        if (!sessionCartId) throw new Error("Session cart ID not found in cookies.");

        const session = await auth();
        const userId = session?.user?.id ? (session.user.id as string) : undefined;

        const cart = await getMyCart();

        // Parse and validate item
        const item = cartItemSchema.parse(data);

        // Find product in database
        const product = await prisma.product.findFirst({
            where: {
                id: item.productId,
            },
        })

        if (!product) throw new Error("Product not found");

        if (!cart) {
            // Create a new cart if it doesn't exist
            const newCart = insertCartSchema.parse({
                userId: userId,
                items: [item],
                sessionCartId: sessionCartId,
                ...calcPrice([item]),
            })
            console.log(newCart)     
        }

        return {
            success: true,
            message: "Item added to cart",
        }
    } catch(error) {
        return {
            success: false,
            message: formatError(error),
        }
    }
   
}

export async function getMyCart() {
    const sessionCartId =(await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("Session cart ID not found in cookies.");

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined; 

    const cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionCartId },
    })

    if (!cart) return undefined

    // Convert decimals and return
    return convertToPlainObject({
        ...cart,
        items: cart.items as CartItem[],
        itemsPrice: cart.itemsPrice.toString(),
        shippingPrice: cart.shippingPrice.toString(),
        taxPrice: cart.taxPrice.toString(),
        totalPrice: cart.totalPrice.toString(),
    })
}