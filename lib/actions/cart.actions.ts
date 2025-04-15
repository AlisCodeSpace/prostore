'use server'

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

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
        const sessionCartId = (await cookies()).get("sessionCartId")?.value;

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
            
            // Add to database
            await prisma.cart.create({
                data: newCart
            })

            // Revalidate product page
            revalidatePath(`/product/${product.slug}`)
            return {
                success: true,
                message: `${product.name} added to cart`,
            } 
        } else {
            // Check if item is already in the cart
            const itemExists = (cart.items as CartItem[]).find((x) => x.productId === item.productId)

            if (itemExists) {
                // Check stock
                if (product.stock < itemExists.qty + 1) {
                    throw new Error('Not enough stock')
                }

                // Increment quantity
                (cart.items as CartItem[]).find((x) => x.productId === item.productId)!.qty = itemExists.qty + 1
            } else {
                // If item does not exist in cart
                // Check stock
                if (product.stock < 1) throw new Error('Not enough stock')
                
                // Add item to the cart.items
                cart.items.push(item)
            }

            await prisma.cart.update({
                where: { id: cart.id },
                data: {
                    items: cart.items as Prisma.CartUpdateitemsInput[],
                    ...calcPrice(cart.items as CartItem[])
                }
            })

            revalidatePath(`/product/${product.slug}`)

            return {
                success: true,
                message: `${product.name} ${itemExists ? 'updated in' : 'added to'} cart`
            }
        }
        
    } catch(error) {
        return {
            success: false,
            message: formatError(error),
        }
    }
   
}

export async function getMyCart() {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

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
        sessionCartId: cart.sessionCartId ?? "", 
        items: cart.items as CartItem[],
        itemsPrice: cart.itemsPrice.toString(),
        shippingPrice: cart.shippingPrice.toString(),
        taxPrice: cart.taxPrice.toString(),
        totalPrice: cart.totalPrice.toString(),
    })
}

export async function removeItemFromCart(productId: string) {
    try {
        const sessionCartId = (await cookies()).get('sessionCartId')?.value

        if (!sessionCartId) throw new Error('Cart session not found')

        const product = await prisma.product.findFirst({
            where: { id: productId }
        })
        if (!product) throw new Error('Product not found')

        // Get user cart
        const cart = await getMyCart()
        if (!cart) throw new Error('Cart not found')

        // Check for item
        const itemExists = (cart.items as CartItem[]).find((x) => x.productId === productId)
        if (!itemExists) throw new Error('Item not found')

        // Check if only one in qty
        if (itemExists.qty === 1) {
            // Remove from cart
            cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== itemExists.productId )
        } else {
            // Decrease item from cart
            (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty = itemExists.qty - 1
        }

        await prisma.cart.update({
            where: { id: cart.id },
            data: {
                items: cart.items as Prisma.CartUpdateitemsInput[],
                ...calcPrice(cart.items as CartItem[])
            }
        })

        revalidatePath(`/product/${product.slug}`)
        return {
            success: true,
            message: `${product.name} was removed from cart.`
        }
    } catch(error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
}