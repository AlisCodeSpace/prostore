'use client'
import { Button } from "@/components/ui/button";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { CartItem } from "@/types/index";
import { toast } from "sonner"
import { useRouter } from "next/navigation";

const AddToCart = ({ item }: { item: CartItem }) => {
    const router = useRouter()
    const handleAddToCart = async () => {
        const response = await addItemToCart(item);

        if (!response.success) {
            toast.error("Error", {
                description: response.message,
            })
            return
        } 

        toast.success("Success", {
            description: `${item.name} added to cart`,
            action: {
                label: "Go To Cart",
                onClick: () => router.push("/cart"),
            }
        })
    };
    return ( 
        <Button className='w-full' type="button"  onClick={handleAddToCart}>
            Add To Cart
        </Button>
     );
}
 
export default AddToCart;