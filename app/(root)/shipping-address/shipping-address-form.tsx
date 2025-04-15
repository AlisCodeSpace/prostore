"use client"

import { shippingAddressSchema } from "@/lib/validators";
import { ShippingAddress } from "@/types";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from "zod";
import { shippingAddressDefault } from "@/lib/constants";
import { useTransition } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { updateUserAddress } from "@/lib/actions/user.actions";
import { toast } from "sonner";

const ShippingAddressForm = ({ address }: { address: ShippingAddress }) => {
    const router = useRouter()

    const form = useForm<z.infer<typeof shippingAddressSchema>>({
        resolver: zodResolver(shippingAddressSchema),
        defaultValues: address || shippingAddressDefault,
    })

    const [isPending, startTransition] = useTransition()
    
    const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (values) => {
        startTransition(async () => {
            const response = await updateUserAddress(values)

            if (!response.success) {
                toast.error('', {
                    description: response.message
                })
                return
            }

            router.push('/payment')
        })
    }
    return ( 
        <div className='max-w-md mx-auto space-y-4'>
            <h1 className="h2-bol mt-4">Shipping Address</h1>
            <p className="text-sm text-muted-foreground">
                Please enter the address to ship to
            </p>
            <Form {...form}>
                <form method="post" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className='flex flex-col md:flex-row gap-5'>
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'fullName'>}) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='flex flex-col md:flex-row gap-5'>
                        <FormField
                            control={form.control}
                            name="streetAddress"
                            render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'streetAddress'>}) => (
                                <FormItem>
                                    <FormLabel>Street Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your street address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='flex flex-col md:flex-row gap-5'>
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'city'>}) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your city" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='flex flex-col md:flex-row gap-5'>
                        <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'postalCode'>}) => (
                                <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your postal code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='flex flex-col md:flex-row gap-5'>
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'country'>}) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='flex gap-2'>
                        <Button type="submit" disabled={isPending} className="cursor-pointer">
                            {isPending ? (
                                <Loader className="w-4 h-4 animate-spin"/>
                            ) : (
                                <ArrowRight className="w-4 h-4"/>
                            )}{''}
                            Continue
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
     );
}
 
export default ShippingAddressForm;