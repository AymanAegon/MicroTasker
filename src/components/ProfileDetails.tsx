
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { ArrowLeft, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/Auth/AuthProvider";
import Link from "next/link";
import { doc, updateDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notFound } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import PasswordChange from "@/components/PasswordChange";
import { ProfileType, Profile } from "@/app/interfaces";

const ProfileDetails = ({ profile }: Profile) => {
  const { firestorePromises, user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [temporalFullName, setTemporalFullName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savingName, setSavingName] = useState<boolean>(false);
  const [savingImage, setSavingImage] = useState<boolean>(false);

  const filteredTasks = profile.tasks.filter(task => {
    if (categoryFilter && categoryFilter !== 'all' && task.category !== categoryFilter) {
      return false;
    }
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && !task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
     if (locationFilter && !task.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (profile) {
      setTemporalFullName(profile.fullName);
    }
  }, [profile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    
    if (event.target.files === null) {
      return;
    }

    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleSaveName = async () => {
    try {
      setSavingName(true);
      if (!profile.uid || profile.uid !== user?.uid) {
        notFound();
      }
      const { getFirestore } = await firestorePromises;
      const db = getFirestore();
      const userDocRef = doc(db, "users", profile.uid);
      const userData = { fullName: temporalFullName };
      await updateDoc(userDocRef, {
        fullName: userData.fullName,
      });
      console.log("Full Name updated successfully!");
      setRefreshKey(refreshKey + 1);
    } catch (error) {
      console.log("Error updating Profile.", error);
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveImage = async () => {
    try {
      setSavingImage(true);
      if (!profile.uid || profile.uid !== user?.uid) {
        notFound();
      }
      const { getFirestore } = await firestorePromises;
      const db = getFirestore();

      if (selectedFile) {

        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload failed:', errorData);
          return;
        }

        const data = await response.json();
        const userDocRef = doc(db, "users", profile.uid);
        await updateDoc(userDocRef, {
          imageUrl: data.secure_url,
        });
      }
      setRefreshKey(refreshKey + 1);
    } catch (error) {
      console.log("Error updating Profile.", error);
    } finally {
      setSavingImage(false);
    }
  };

  return (
    <div key={refreshKey} className="flex flex-col justify-center items-center py-10 bg-secondary gap-4 w-full min-h-screen">
      <div className="w-full max-w-5xl px-4">
        {!isEditing && (
          <Link href="/" className="flex items-center text-blue-500 hover:underline mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        )}
        <Card className="w-full">
          <CardHeader className="p-6 pb-0">
            <div className="flex gap-4 items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img
                  src={profile.imageUrl || `https://i.pravatar.cc/150?u=${profile.uid}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                <h3 className="text-lg text-gray-600" >
                  {profile.role === "taskPoster" ? "(Task Poster)" : "(Tasker)"}
                </h3>
              </div>
            </div>
            <div className="absolute top-6 right-6">
              {!isEditing && profile.uid === user?.uid ? (
                <Settings
                  onClick={() => setIsEditing(true)}
                  className="mr-2 h-4 w-4 cursor-pointer"
                />
              ) : isEditing && (
                <X
                  onClick={() => setIsEditing(false)}
                  className="mr-2 h-4 w-4 cursor-pointer"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="w-full flex gap-1.5 items-center">
                  <Label className="" htmlFor="fullName">Full Name</Label>
                  <Input
                    className="w-4/6 flex-none"
                    id="fullName"
                    name="fullName"
                    value={temporalFullName}
                    onChange={(e) => setTemporalFullName(e.target.value || "")}
                  />
                  <Button className="w-1/6 flex-auto" onClick={handleSaveName} disabled={savingName}>
                    {savingName ? "Saving..." : "Save Name"}
                  </Button>
                </div>
                <div className="w-full flex gap-1.5 items-center">
                  <Label className="" htmlFor="image">
                    Profile Image
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-4/6 flex-none"
                  />
                  <Button className="w-1/6 flex-auto" onClick={handleSaveImage} disabled={savingImage}>
                    {savingImage ? "Saving..." : "Save Image"}
                  </Button>
                </div>
                <Dialog open={open} onOpenChange={setOpen} >
                  <DialogTrigger asChild>
                    <Button>Change the password</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Changing the password</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Make sure to choose a strong password!</DialogDescription>
                    <PasswordChange closeDialog={() => setOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">Total tasks: {profile.tasks.length}</div>
                <div className="mb-4 flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {/* <Input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  /> */}
                  <Select onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="handyman">Handyman</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4">
                  {filteredTasks.map((task) => (
                    <Link href={`/task/${task.id}`} key={task.id} className="no-underline">
                      <Card className="relative hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="absolute top-2 right-2">
                            <span className="font-semibold">Budget: ${task.budget}</span>
                          </div>
                          <div className="mb-2">
                            <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
                          </div>
                          <div>
                            <CardDescription className="text-sm text-gray-600">
                              {task.description}
                            </CardDescription>
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <span className="text-sm">Location: {task.location}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default ProfileDetails;