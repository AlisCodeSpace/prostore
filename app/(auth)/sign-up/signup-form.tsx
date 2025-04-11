"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { signUpUser } from "@/lib/actions/user.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

const SignUpForm = () => {
    const [data, action] = useActionState(signUpUser, {
        success: false,
        message: ''
    });

    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    const SignInButton = () => {
        const { pending } = useFormStatus()

        return (
            <Button disabled={pending} variant='default' className="w-full">
                { pending ? 'Submitting...' : 'Sign Up'}
            </Button>
        )
    }
    return ( 
        <form action={action}>
            <input type="hidden" name="callbackUrl" value={callbackUrl}/>
            <div className='space-y-6'>
                <div>
                    <Label htmlFor='name' className="mb-2">Name</Label>
                    <Input id="name" name="name" type="text" required autoComplete="name" defaultValue={signUpDefaultValues.name}/>
                </div>
                <div>
                    <Label htmlFor='email' className="mb-2">Email</Label>
                    <Input id="email" name="email" type="email" required autoComplete="email" defaultValue={signUpDefaultValues.email}/>
                </div>
                <div>
                    <Label htmlFor='password' className="mb-2">Password</Label>
                    <Input id="password" name="password" type="password" required autoComplete="password" defaultValue={signUpDefaultValues.password}/>
                </div>
                <div>
                    <Label htmlFor='confirmPassword' className="mb-2">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="confirmPassword" defaultValue={signUpDefaultValues.confirmPassword}/>
                </div>
                <div>
                    <SignInButton />
                </div>

                {data && !data.success && (
                    <div className='text-center text-destructive'>
                        {data.message}
                    </div>
                )}

                <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{' '}  
                    <Link href="/sign-in" target="_self" className="text-black font-medium hover:underline">Sign In</Link>
                </div>
            </div>
        </form>
     );
}
 
export default SignUpForm;