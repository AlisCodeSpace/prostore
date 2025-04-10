/* eslint-disable @typescript-eslint/no-explicit-any */

import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";


export const config = {
    pages: {
        signIn: '/signin',
        // signOut: '/signout',
        error: '/signin',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (credentials == null) return null

                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email as string,
                    }
                })

                if (user && user.password) {
                    const isMatch = compareSync(credentials.password as string, user.password)

                    // If password matches, return user object
                    if (isMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            role: user.role,
                        }
                    }
                }
                
                return null
            }
        })   
    ],
    callbacks: {
        async session({ session, user, trigger, token }: any) {
            // Set the user ID from the token
            if (token) {
                session.user.id = token.sub
                // session.user.role = token.role
            }

            if (trigger === 'update') {
                session.user.name = user.name
            }
            return session
        }
    }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut} = NextAuth(config)