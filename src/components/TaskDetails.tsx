
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";;
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/Auth/AuthProvider";
import { toast } from "sonner";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  userId: string;
  budget: number;
  category: string;
}

interface TaskDetailsProps {
  task: Task;
  currentUserId: string | undefined;
}

const TaskDetails = ({ task, currentUserId }: TaskDetailsProps) => {
  const router = useRouter();
  const { user, firestorePromises  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [refreshKey, setRefreshKey] = useState(0);
  currentUserId = user?.uid
  const handleAcceptTask = () => {
    alert(`Task "${task.title}" accepted!`);
  };

  const handleEditTask = () => {
    setIsEditing(true);
  };

  const handleSaveTask = async () => {
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
          // Add other fields you want to update here
      });

      toast.success("Task updated successfully!");
      window.location.reload()
      setRefreshKey(refreshKey + 1);
    } catch (error) {
      toast.error("Error updating task.");
    }
  };

  const handleDeleteTask = async () => {
    if (task.userId !== currentUserId && currentUserId) {
        toast.error("You are not authorized to delete this task.");
        return;
      }
    
    try {
        console.log("Deleting task:", task.id);
        const { getFirestore } = await firestorePromises;
        const db = getFirestore();
        
        await deleteDoc(doc(db, "tasks", task.id));

        toast.success("Task deleted successfully!");
        router.push("/");
        
    } catch (error) {
      toast.error("Error deleting task.");
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setEditedTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  return (
    <>
    <div key={refreshKey} className="flex flex-col justify-center items-center py-10 bg-secondary gap-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <CardDescription>{task.description}</CardDescription>
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
                <Input id="category" name="category" value={editedTask.category} onChange={handleInputChange} />
              </div>
            ) : (
              <>
                <p>Location: {task.location}</p>
                <p>Budget: ${task.budget}</p>
                <p>Category: {task.category}</p>
              </>
            )}
          </div>
          {isEditing && (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask}>Save</Button>
            </div>
          )}
          {task.userId === currentUserId && !isEditing ? (
            <div className="flex gap-4">
              <Button onClick={handleEditTask} variant="outline" className="w-full">
                Edit
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">Delete</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>This action cannot be undone. This will permanently delete your task and remove your data from our servers.</DialogDescription>
                    <Button onClick={handleDeleteTask} variant="destructive" className="w-full">Delete</Button>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          ) : ( task.userId !== currentUserId && (
            <div className="flex gap-4">
              <Button onClick={handleAcceptTask} className="w-full">
                Accept Task
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    <span style={{ display: "none" }}>{refreshKey}</span>
    </>
  );
};

export default TaskDetails;
