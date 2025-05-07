"use client";

import TaskList from "@/components/TaskList";
import { useAuth, useFirebase } from "@/components/Auth/AuthProvider"; // Corrected import
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
import { ProfileType, Task } from "@/app/interfaces";
import { getFirestore, getDocs, doc, getDoc } from "firebase/firestore";
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore"; // Import firestore functions
import { Badge } from "@/components/ui/badge"; // Import Badge component
import MapView from "@/components/MapView";

export default function Home() {
  const { user, firestorePromises } = useAuth(); // Destructure firestorePromises from useAuth

  const { app } = useFirebase(); // Destructure app from useFirebase
  const router = useRouter();
  const auth = getAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mapOpen, setMapOpen] = useState<boolean>(false);
  const [newRequestCount, setNewRequestCount] = useState<number>(0); // State for new request count
  const [position, setPosition] = useState({
    lng: -6.930383240172404,
    lat: 33.91743073825462,
  });
  const [sortOption, setSortOption] = useState('new');

  const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Fetch new request count
    const fetchNewRequestCount = async () => {
      if (!app || !user?.uid || !firestorePromises) return; // Ensure necessary variables are available

      try {
        const { getFirestore } = await firestorePromises;
        const db = getFirestore(app);
        const requestsRef = collection(db, "requests");
        // Query for requests where the receiver is the current user and status is pending
        const q = query(
          requestsRef,
          where("reciverId", "==", user.uid),
          where("status", "==", "pending")
        );
        const snapshot = await getCountFromServer(q);
        setNewRequestCount(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching new request count:", error);
        setNewRequestCount(0); // Reset count on error
      }
    };

    fetchNewRequestCount();
    // Set up the interval
    const intervalId = setInterval(fetchNewRequestCount, 5000); // Fetch every 5 seconds

    // Clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [user, router, app, firestorePromises]); // Add dependencies

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { getFirestore } = await firestorePromises;
        let db;

        if (app) {
          db = getFirestore(app);
        }
        if (db) {
          const tasksCollection = collection(db, "tasks");
          const tasksSnapshot = await getDocs(tasksCollection);
          const tasksPromises = tasksSnapshot.docs.map(async (docu) => {
            const data = docu.data();
            const taskOwnerDocRef = doc(db, "users", data.userId);
            const taskOwnerSnapshot = await getDoc(taskOwnerDocRef);
            return { id: docu.id, owner: taskOwnerSnapshot.data(), ...data } as Task;
          });

          if (sortOption === 'expensive') {
            var tasksData = (await Promise.all(tasksPromises)).sort((a, b) => b.budget - a.budget);
          } else if (sortOption === 'cheapest') {
            var tasksData = (await Promise.all(tasksPromises)).sort((a, b) => a.budget - b.budget)
          } else {
            var tasksData = (await Promise.all(tasksPromises)).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          }

          setTasks(tasksData);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }

    };

    fetchTasks();
  }, [app, firestorePromises, tasks]);

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold mb-6">MicroTasker</h1>{" "}
        {/* Updated App Name */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-2 cursor-pointer">
                {" "}
                {/* Added cursor-pointer */}
                <div className="relative">
                  {" "}
                  {/* Relative wrapper for absolute positioning */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                    {" "}
                    {/* Avatar container */}
                    <img
                      // Use a consistent placeholder or fetch user's actual avatar
                      src={
                        (user as ProfileType).imageUrl ||
                        `https://res.cloudinary.com/drmmom6jz/image/upload/v1746027479/Screenshot_from_2025-04-30_16-37-48_g58zzn.png`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {newRequestCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full p-0 flex items-center justify-center"
                    ></Badge>
                  )}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {" "}
              {/* Align to the end */}
              <DropdownMenuLabel>
                {(user as ProfileType).fullName || user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.uid}`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/requests`}
                  className="flex justify-between items-center w-full"
                >
                  <span>Requests</span>
                  {newRequestCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-2 px-2 py-0.5 text-xs"
                    >
                      {newRequestCount}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator /> {/* Added separator */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                {" "}
                {/* Destructive style for logout */}
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
          <Button onClick={() => setMapOpen(!mapOpen)} style={{ marginLeft: "10px" }}>
            {mapOpen ? "List tasks" : "Find on map"}
          </Button>
        </div>
      ) : (
        <div className="mt-6"></div>
      )}
      {mapOpen ? <MapView position={position} setPosition={setPosition} tasks={tasks} /> : <TaskList tasks={tasks} setSortOption={setSortOption} />}
    </main>
  );
}
