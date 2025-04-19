
"use client"

import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { useEffect } from "react";
import { User } from "firebase/auth";
interface Role {
  role?: string;
};

type AppUser = User & { fullName?: string } & Role;

export default async function ProfilePage() {
  const { user } = useAuth();
  const currentUser = user as AppUser;
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  return (
    <div className="container py-10">
      <Button variant="outline" size="sm" asChild>
        <a href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </a>
      </Button>
      <div className="mx-auto mt-8 max-w-md">
        <h1 className="text-3xl font-bold">Profile Details</h1>
        <Separator className="my-4" />
        <div className="space-y-2">
          <p>
            <strong>Full Name:</strong> {currentUser.fullName}
          </p>
          <p>
            <strong>Email:</strong> {currentUser.email}
          </p>
          <p>
            <strong>Role:</strong> {currentUser.role}
          </p>
        </div>
      </div>
    </div>
  )
}