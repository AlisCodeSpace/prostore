'use client'
import { Button } from "@/components/ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Cart, CartItem } from "@/types/index";
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import { Loader, Minus, Plus } from "lucide-react";
import { useTransition } from "react";

const AddToCart = ({ item, cart }: { item: CartItem, cart?: Cart }) => {
    const router = useRouter()

    const [isPending, startTransition] = useTransition()
    const handleAddToCart = async () => {
        startTransition(async () => {
            const response = await addItemToCart(item);

            if (!response.success) {
                toast.error("Error", {
                    description: response.message,
                })
                return
            } 

            toast.success("Success", {
                description: response.message,
                action: {
                    label: "Go To Cart",
                    onClick: () => router.push("/cart"),
                }
            })
        })
    };

    const handleRemoveFromCart = async () => {
        startTransition(async () => {
            const response = await removeItemFromCart(item.productId)

            if (!response.success) {
                toast.error("", { description: response.message})
            }
            toast.success("", { description: response.message})
            return;
        })
    }

    // Check if item is in cart
    const itemExists = cart && cart.items.find((x) => x.productId === item.productId)

    return itemExists ? (
        <div className='flex items-center'>
            <Button type="button" variant='outline' onClick={handleRemoveFromCart}>
                {isPending ? <Loader className="h-4 w-4 animate-spin"/> : <Minus className="h-4 w-4"/>}
            </Button>
            <span className="px-2">{itemExists.qty}</span>
            <Button type="button" variant='outline' onClick={handleAddToCart}>
                {isPending ? <Loader className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>}
            </Button>
        </div>
    ) : (
        <Button className='w-full' type="button"  onClick={handleAddToCart}>
                {isPending ? <Loader className="h-4 w-4 animate-spin"/> : <><Plus /> Add To Cart</>}
        </Button>
    );
}
 
export default AddToCart;