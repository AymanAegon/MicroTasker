
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { ArrowLeft } from "lucide-react"
import { Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Task, Request } from "@/app/interfaces";
import MapView from "./MapView";

interface TaskDetailsProps {
  task: Task;
}

const TaskDetails = ({ task }: TaskDetailsProps) => {
  const { firestorePromises } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  const router = useRouter();
  const currentUserId = user?.uid as string;
  const [message, setMessage] = useState('');
  const [requestExists, setRequestExists] = useState(false);
  const [request, setRequest] = useState<Request | null>(null);
  const [buttonClass, setButtonClass] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [position, setPosition] = useState(task.position || { lng: 0, lat: 0 });

  useEffect(() => {
    const fetchRequest = async () => {
      if (!task.id || !user?.uid || !task.userId) return;
      const { getFirestore } = await firestorePromises;
      const db = getFirestore();
      const requestRef = doc(db, "requests", task.id + user?.uid + task.userId,);
      const requestSnap = await getDoc(requestRef);
      const taskData = requestSnap.data();
      if (requestSnap.exists()) {
        setRequestExists(true);
        setRequest(taskData as Request);
        if (taskData?.status === "pending") {
          setButtonClass("bg-gray-200 text-gray-500 hover:bg-gray-300");
        } else if (taskData?.status === "accepted") {
          setButtonClass("bg-green-500 text-white hover:bg-green-600");
        } else if (taskData?.status === "canceled") {
          setButtonClass("bg-gray-200 text-gray-500 hover:bg-gray-300");
        } else if (taskData?.status === "rejected") {
          setButtonClass("bg-red-500 text-white hover:bg-red-600");
        } else if (taskData?.status === "completed") {
          setButtonClass("bg-gray-200 text-gray-500 hover:bg-gray-300");
        }
      }
    };
    fetchRequest();
  }, [task.id, firestorePromises, refreshKey]);

  const handleRequestTask = async () => {
    // alert(`Task "${task.title}" accepted!`);
    if (!user) {
      router.push('/login');
      return;
    }
    const { getFirestore } = await firestorePromises;
    const db = getFirestore();
    try {
      if (!request) {
        await setDoc(doc(db, "requests", task.id + user?.uid + task.userId), {
          message,
          taskId: task.id,
          senderId: user.uid,
          reciverId: task.userId,
          dateSend: new Date().toString(),
          dateRespond: "",
          status: "pending",
        });
      } else {
        await updateDoc(doc(db, "requests", task.id + user?.uid + task.userId), {
          message,
          dateSend: new Date().toString(),
          status: "pending",
        });
      }
      setMessage("");
      setRefreshKey(refreshKey + 1);
    } catch (err) {
      console.error(err);
    };
  }

  const handleRequestCancel = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const { getFirestore } = await firestorePromises;
    const db = getFirestore();
    try {
      if (!request) {
        await setDoc(doc(db, "requests", task.id + user?.uid + task.userId), {
          message,
          taskId: task.id,
          senderId: user.uid,
          reciverId: task.userId,
          dateSend: new Date().toString(),
          dateRespond: "",
          status: "canceled",
        });
      } else {
        await updateDoc(doc(db, "requests", task.id + user?.uid + task.userId), {
          status: "canceled",
        });
      }
      setMessage("");
      setRefreshKey(refreshKey + 1);
    } catch (err) {
      console.error(err);
    };
  }

  const isTaskOwner = task.userId === currentUserId;

  const [isEditing, setIsEditing] = useState(false);
  // const [isRequesting, setIsRequesting] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);

  const handleSave = async () => {
    try {
      console.log("Saving task:", editedTask);
      if (!editedTask.id) return;
      const { getFirestore } = await firestorePromises;
      const db = getFirestore();

      const taskDocRef = doc(db, "tasks", editedTask.id);
      const { id, ...taskData } = editedTask;
      await updateDoc(taskDocRef, {
        title: taskData.title,
        description: taskData.description,
        location: taskData.location,
        budget: taskData.budget,
        category: taskData.category,
        position: position,
        // Add other fields you want to update here
      });

      console.log("Task updated successfully!");
      window.location.reload()
      setRefreshKey(refreshKey + 1);
    } catch (error) {
      console.log("Error updating task.");
    }
  };

  const handleDelete = async () => {
    if (task.userId !== currentUserId && currentUserId) {
      alert('You are not authorized to delete this task.');
      return;
    }
    try {
      const { getFirestore } = await firestorePromises;
      const db = getFirestore();
      await deleteDoc(doc(db, "tasks", task.id));
      router.push('/');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setEditedTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  return (
    <>
      <div key={refreshKey} className="flex flex-col justify-center items-center py-10 bg-secondary gap-4 w-full min-h-screen">
        <div className="w-full max-w-2xl px-4">
          <Button variant={"link"} size={"sm"} onClick={() => router.back()} className="p-0 mb-2">
            <ArrowLeft className="mr-0 h-4 w-4" />
            Go Back
          </Button>

          <Card className="w-full">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="text-3xl font-bold">
                <div className="flex items-center gap-2">
                  <span>{task.title}</span>
                  <Link href={`/profile/${task.owner.uid}`} key={task.owner.uid} className="flex items-center gap-2 no-underline">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <img src={task.owner.imageUrl || `https://res.cloudinary.com/drmmom6jz/image/upload/v1746027479/Screenshot_from_2025-04-30_16-37-48_g58zzn.png`} alt="Profile" className="object-cover w-full h-full" />
                    </div>
                    <span>{task.owner.fullName}</span>
                  </Link>
                </div>

              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="grid gap-2">
                {isEditing ? (
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" value={editedTask.title} onChange={handleInputChange} />
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" value={editedTask.description} onChange={handleInputChange} />
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" value={editedTask.location} onChange={handleInputChange} />
                    <Label htmlFor="budget">Budget</Label>
                    <Input id="budget" type="number" name="budget" value={editedTask.budget} onChange={handleInputChange} />
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(value) =>
                        setEditedTask({ ...editedTask, category: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="handyman">Handyman</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {!showMap ? <Button onClick={() => setShowMap(true)}>Change Location</Button> : (
                      <>
                        <Button onClick={() => setShowMap(false)}>Cancel</Button>
                        <MapView position={position} setPosition={setPosition} draggable/>
                      </>
                    )}

                    {/* <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={editedTask.category} onChange={handleInputChange} /> */}
                  </div>
                ) : (
                  <>
                    <div className="text-gray-600">{task.description}</div>
                    <div className="flex flex-col gap-y-1">
                      <span className="font-semibold">City:</span>
                      <span className="text-gray-600">{task.location}</span>
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <span className="font-semibold">Budget:</span>
                      <span className="text-gray-600">${task.budget}</span>
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <span className="font-semibold">Category:</span>
                      <span className="text-gray-600">{task.category}</span>
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <span className="font-semibold text-blue-500 cursor-pointer" onClick={() => setShowMap(true)}>Show on map</span>
                    </div>
                    {showMap && (
                      <>
                        <Button onClick={() => setShowMap(false)}>Close</Button>
                        <MapView position={position} setPosition={setPosition} tasks={[task]} />
                      </>
                    )}
                  </>
                )}
              </div>
              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => { setIsEditing(false); setShowMap(false) }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              )}
              {task.userId !== currentUserId && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className={`w-full ${buttonClass}`}>
                      {(requestExists && request?.status === "pending") && "Pending"}
                      {(requestExists && request?.status === "accepted") && "Accepted"}
                      {(requestExists && request?.status === "rejected") && "Rejected"}
                      {(requestExists && request?.status === "completed") && "Completed"}
                      {(!requestExists || request?.status === "canceled") && "Request"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Task</DialogTitle>
                      <DialogDescription>
                        {!requestExists || request?.status === "canceled" ? (
                          `Send a request with a message to do this task for ${task.owner.fullName}.`
                        ) : request?.status === "pending" ? (
                          `You have sent a request to ${task.owner.fullName}. do you want to cancel the request?`
                        ) : (
                          `You have already sent a request to ${task.owner.fullName}.`
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    {!requestExists || request?.status === "canceled" ? (
                      <>
                        <Textarea id="request-msg" name="request-msg" onChange={(e) => setMessage(e.target.value)} />
                        <Button
                          onClick={handleRequestTask}
                          className="flex items-center">
                          Request
                        </Button>
                      </>
                    ) : request?.status === "pending" && (
                      <Button
                        onClick={handleRequestCancel}
                        className="flex items-center bg-gray-200 text-gray-500 hover:bg-gray-300">
                        Cancel request
                      </Button>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
            <CardContent className="p-6 pt-2 flex justify-between gap-4">
              {isTaskOwner && !isEditing && (
                <Button
                  onClick={() => { setIsEditing(true); setShowMap(false) }}
                  variant="outline"
                  className="flex items-center w-full"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {isTaskOwner && !isEditing && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant={"destructive"} className="w-full">Delete</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure you want to delete this task?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently remove the task from the database.
                      </DialogDescription>
                    </DialogHeader>
                    <Button onClick={handleDelete}
                      variant="destructive"
                      className="flex items-center">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>

  );
};

export default TaskDetails;
