import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from './prisma';

const SALT_ROUND = 10;

export const NEXT_AUTH = {
    providers: [
        CredentialsProvider({
            id: 'Login',
            name: 'Login',
            credentials: {
                email: { label: 'email', type: 'text', placeholder: '', required: true },
                password: { label: 'password', type: 'password', placeholder: '', required: true },
            },
            async authorize(credentials: Record<"email" | "password", string> | undefined) {
                if (!credentials || !credentials.email || !credentials.password) {
                    return null;
                }
                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email.trim(),
                        },
                    });
                    if (!user) {
                        return null;
                    }
                    const res = await bcrypt.compare(credentials.password.trim(), user.password)
                    if (!res) {
                        return null;
                    }
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    };
                }
                catch (error) {
                    console.log('Error in authorize:', error);
                    return null;
                }
            },
        }),

        CredentialsProvider({
            id: 'newUser',
            name: 'SignUp',
            credentials: {
                name: { label: 'name', type: 'text', placeholder: '', required: true },
                email: { label: 'email', type: 'text', placeholder: '', required: true },
                password: { label: 'password', type: 'password', placeholder: '', required: true },
            },
            async authorize(credentials: Record<"name" | "email" | "password", string> | undefined) {
                if (!credentials || !credentials.name || !credentials.email || !credentials.password) {
                    return null;
                }
                const hashedPassword = await bcrypt.hash(credentials.password.trim(), SALT_ROUND);
                try {
                    const user = await prisma.user.create({
                        data: {
                            name: credentials.name.trim(),
                            email: credentials.email.trim(),
                            password: hashedPassword,
                            image: null,
                        },
                    })
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    };
                } catch (error) {
                    console.log('Error in authorize:', error);
                    return null;
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
        newUser: '/signup',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    cookies: {
        sessionToken: {
            name: "next-auth.session-token",
            options: {
                sameSite: "None",
                secure: true,
            },
        },
    },

} satisfies NextAuthOptions;
