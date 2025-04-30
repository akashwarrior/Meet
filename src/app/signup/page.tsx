"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { unstable_ViewTransition as Transition } from "react";
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function Signup() {
    const router = useRouter()
    const nameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const name = nameRef.current?.value || ""
        const email = emailRef.current?.value || ""
        const password = passwordRef.current?.value || ""

        if (!name.trim()) {
            toast.error("Please enter your name")
            return
        }

        if (!email.trim()) {
            toast.error("Please enter your email")
            return
        }

        if (!password.trim()) {
            toast.error("Please enter a password")
            return
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setLoading(true)

        signIn("newUser", {
            name,
            email,
            password,
            redirect: false,
        }).then((res) => {
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success("Account created successfully")
                router.back()
            }
        }).catch(() => {
            toast.error("Something went wrong")
        }).finally(() => {
            setLoading(false)
        })
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center dark:bg-black/50 bg-muted relative overflow-hidden">
            <div className="absolute w-full h-full overflow-visible z-0 top-0 left-0 origin-center animate-bg-effect">
                <div className="absolute bottom-20 left-20 bg-[#3291ff] w-1/2! h-1/2! dark:w-1/6 dark:h-1/6 blur-[250px] rounded-full"></div>
                <div className="absolute top-20 right-20 bg-[#79ffe1] w-1/2! h-1/2! dark:w-1/6 dark:h-1/6 blur-[250px] rounded-full"></div>
            </div>
            <Transition name="credentials">
                <div className="z-10 w-full max-w-[450px] h-[80vh] p-11 rounded-lg bg-background flex flex-col max-h-[600px]">
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between ">
                        <div className="flex flex-col items-center mb-4 gap-3 text-center">
                            <Transition name="titles">
                                <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                                <p className="text-muted-foreground mb-6">Enter your information to get started</p>
                            </Transition>
                        </div>

                        <div className="flex flex-col gap-6">
                            <Input
                                ref={nameRef}
                                id="name"
                                type="text"
                                maxLength={64}
                                autoComplete="name"
                                placeholder="Full Name"
                                className="py-5.5 focus-visible:ring-primary px-4"
                                required
                            />
                            <Transition name="email">
                                <Input
                                    ref={emailRef}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    className="py-5.5 focus-visible:ring-primary px-4"
                                    required
                                />
                            </Transition>
                            <div className="relative">
                                <Transition name="password">
                                    <Input
                                        ref={passwordRef}
                                        id="password"
                                        minLength={8}
                                        autoComplete="new-password"
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
                            <p className="text-muted-foreground text-xs mx-1">
                                Use 8 or more characters with a mix of letters, numbers & symbols
                            </p>
                        </div>

                        <div className="pt-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <Link
                                    href="/login"
                                    className="text-[#1a73e8] hover:text-[#174ea6] font-medium text-sm order-2 sm:order-1"
                                >
                                    Sign in instead
                                </Link>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 rounded-md w-full sm:w-auto order-1 sm:order-2"
                                >
                                    {loading ? "Creating account..." : "Create Account"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </Transition>
        </div>
    )
}