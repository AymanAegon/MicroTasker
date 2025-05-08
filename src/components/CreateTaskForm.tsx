
"use client";

import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MapView from "@/components/MapView";

const CreateTaskForm = ({ closeDialog }: { closeDialog: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');
  const { user, firestorePromises } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [position, setPosition] = useState({
    lng: -6.930383240172404,
    lat: 33.91743073825462,
  });
  const [taskPosition, setTaskPosition] = useState({
    lng: 0,
    lat: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { getFirestore } = await firestorePromises;

      const db = getFirestore();
      await addDoc(collection(db, "tasks"), {
        title,
        description,
        location,
        budget,
        category,
        userId: user.uid,
        createdAt: new Date().toString(),
        position: (taskPosition.lng !== 0 || taskPosition.lat !== 0) && taskPosition,
      });

      setTitle("");
      setDescription("");
      setLocation("");
      setBudget("");
      setCategory("");
      closeDialog();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center py-0 bg-secondary">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Post a Task</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleSubmit}
            className="grid gap-4">             <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task Title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task Description"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Task Location"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Your Budget"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={setCategory}>
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
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  Add a map location to your task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add your task to the map</DialogTitle>
                </DialogHeader>
                <MapView position={position} setPosition={setPosition} draggable />
                <Button className="w-full" onClick={() => {setTaskPosition({...position}); setOpen(false)}}>
                  Set position
                </Button>
              </DialogContent>
            </Dialog>
            <Button type="submit" className="w-full">
              Post Task
            </Button>
          </form>
          <Button variant={"outline"} onClick={closeDialog} className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTaskForm;
