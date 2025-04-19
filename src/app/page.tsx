
"use client";

import TaskList from "@/components/TaskList";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { User } from "firebase/auth";
import { useEffect } from "react";
import { useState } from 'react';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import CreateTaskForm from "@/components/CreateTaskForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
interface Role {
  role?: string;
};

type AppUser = User & { fullName?: string } & Role;

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = getAuth();
  const [open, setOpen] = useState<boolean>(false);
  
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
              Hello, <Link href="/profile" className="underline text-blue-500">{(user as AppUser).fullName || user.email}
              </Link>
            </span>
          )}
          
        </div>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      {user && (user as AppUser).role === "taskPoster" ? (
        <div className="my-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Post a Task</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create a task</DialogTitle>
              </DialogHeader>
              <CreateTaskForm closeDialog={()=> setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="mt-6"></div>
      )}
      <TaskList />
    </main>
  );
}
