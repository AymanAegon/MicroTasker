
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, Fragment } from "react";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "firebase/auth";
interface UserAttr {
  fullName: string;
  role: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  category: string;
  userId: string;
}

type ProfileType = User & UserAttr & { tasks: Task[] };
interface Profile {
  profile: ProfileType;
}

const ProfileDetails = ({ profile }: Profile) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

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

  return (
    <div key={refreshKey} className="flex flex-col justify-center items-center py-10 bg-secondary gap-4 w-full min-h-screen">
      <div className="w-full max-w-5xl px-4">
        <Link href="/" className="flex items-center text-blue-500 hover:underline mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <Card className="w-full">
          <CardHeader className="p-6 pb-0">
            <CardTitle>
              <span className="text-3xl font-bold">
                {profile.fullName}
              </span>
              <span className="text-lg text-gray-600">
                {profile.role === "taskPoster" ? "  (Task Poster)" : "  (Tasker)"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <div className="grid gap-2">
              Total tasks: {profile.tasks.length}
            </div>
            <div className="mb-4 flex space-x-2">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
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
              {filteredTasks.map(task => (
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
              {filteredTasks.length === 0 && <p>No tasks found.</p>}
            </div>
          </CardContent>
        </Card>        
      </div>
    </div>
    
  );
};

export default ProfileDetails;
