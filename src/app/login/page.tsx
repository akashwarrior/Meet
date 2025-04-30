"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { unstable_ViewTransition as Transition } from "react";
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"

export default function Login() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user) {
            const callbackUrl = searchParams.get("callbackUrl") || "/"
            router.push(callbackUrl)
        }
    }, [session, searchParams, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        const email = emailRef.current?.value || ""
        const password = passwordRef.current?.value || ""

        setLoading(true)
        try {
            const res = await signIn("Login", {
                email,
                password,
                redirect: false,
            })
            if (!res || res?.error) {
                toast.error("Login failed")
            } else {
                toast.success("Login successful")
            }
        } catch (err) {
            console.log(err)
            toast.error("Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center dark:bg-black/50 bg-muted relative overflow-hidden">
            <div className="absolute w-full h-full overflow-visible z-0 top-0 left-0 origin-center animate-bg-effect">
                <div className="absolute bottom-20 left-20 bg-[#3291ff] w-1/2! h-1/2! dark:w-1/6 dark:h-1/6 blur-[250px] rounded-full"></div>
                <div className="absolute top-20 right-20 bg-[#79ffe1] w-1/2! h-1/2! dark:w-1/6 dark:h-1/6 blur-[250px] rounded-full"></div>
            </div>
            <Transition name="credentials">
                <div className="z-10 w-full max-w-[450px] h-[80vh] p-11 rounded-lg bg-background flex flex-col max-h-[600px] justify-between">
                    <div className="flex flex-col items-center mb-4 gap-3 text-center">
                        <Transition name="titles">
                            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                            <p className="text-muted-foreground mb-6">Enter your credentials to access your account</p>
                        </Transition>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-10">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>

                            <Transition name="email">
                                <Input
                                    ref={emailRef}
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="py-5.5 focus-visible:ring-primary px-4"
                                    required
                                />
                            </Transition>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Transition name="password">
                                    <Input
                                        ref={passwordRef}
                                        minLength={8}
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="py-5.5 focus-visible:ring-primary px-4"
                                        required
                                    />
                                </Transition>
                                {showPassword ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute! right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                        onClick={() => setShowPassword(false)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute! right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                        onClick={() => setShowPassword(true)}
                                    >
                                        <EyeOff className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-5.5 rounded-full text-base"
                        >
                            {loading ? "Loading..." : "Login"}
                        </Button>
                    </form>


                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </Transition>
        </div>
    )
}