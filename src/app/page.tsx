
"use client";

import TaskList from "@/components/TaskList";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { User } from "firebase/auth";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import CreateTaskForm from "@/components/CreateTaskForm";

interface Role {
  role?: string;
}

type AppUser = User & { fullName?: string } & Role;

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = getAuth();

    const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-semibold mb-6">Nearby Tasks</h1>
          {user && (
            <span className="text-sm">
              Hello, {(user as AppUser).fullName || user.email}
            </span>
          )}
        </div>
          <Button onClick={handleLogout}>Logout</Button>
      </div>
        {user && (user as AppUser).role === "taskPoster" ? (
          <div className="my-6">
            <CreateTaskForm />
          </div>
        ) : (
            <div className="mt-6">You are not authorized to post tasks.</div>
          )}
        <TaskList />
    </main>
  );
}
