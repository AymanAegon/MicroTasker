
"use client";

import TaskList from "@/components/TaskList";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "@/components/CreateTaskForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileType } from "@/app/interfaces";

export default function Home() {
  const { user } = useAuth();  const router = useRouter();  const auth = getAuth();  const [open, setOpen] = useState<boolean>(false);
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
        <h1 className="text-3xl font-semibold mb-6">MicroTasker</h1>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-2">
                <div className="w-[40px] h-[40px] rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img
                    src="https://i.pravatar.cc/150?img=60"                    
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                {(user as ProfileType).fullName || user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/profile/${user.uid}`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/requests`}>Requests</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {user && (user as ProfileType).role === "taskPoster" ? (
        <div className="my-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Post a Task</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create a task</DialogTitle>
              </DialogHeader>
              <CreateTaskForm closeDialog={() => setOpen(false)} />
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
