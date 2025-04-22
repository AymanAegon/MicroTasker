"use client";

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/components/Auth/AuthProvider';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getNearbyLocations, Location } from "@/services/location";
import Link from 'next/link';
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

interface User {
  uid?: string;
  fullName: string;
  email: string;
  role: string;
}

interface Task {
  id?: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  category: string;
  userId: string;
  owner: User;
}

const TaskList = () => {
  const { firestorePromises } = useAuth();
  const {app} = useFirebase();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  // const [location, setLocation] = useState<Location>({ lat: 34.0522, lng: -118.2437 }); // Default to Los Angeles
  const [categoryFilter, setCategoryFilter] = useState('');
  // const [priceFilter, setPriceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { getFirestore } = await firestorePromises;
        let db;
        
        if (app) {
          db = getFirestore(app);
        }
        if(db){
          const tasksCollection = collection(db, "tasks");
          const tasksSnapshot = await getDocs(tasksCollection);
          const tasksPromises = tasksSnapshot.docs.map(async (docu) => {
            const data = docu.data();
            const taskOwnerDocRef = doc(db, "users", data.userId);
            const taskOwnerSnapshot = await getDoc(taskOwnerDocRef);
            return { id: docu.id, owner: taskOwnerSnapshot.data(), ...data } as Task;
          });

          const tasksData = await Promise.all(tasksPromises)

          setTasks(tasksData);
        }

      } catch (error) {
        console.error("Error fetching tasks:", error);
      }

    };

    fetchTasks();
  }, [app, firestorePromises,tasks]);

  const filteredTasks = tasks.filter(task => {
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
    <div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="mt-2">
                  <span className="text-sm">Location: {task.location}</span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="text-sm">For: {task.owner && task.owner.fullName ? task.owner.fullName : 'Unknown Owner'}</span>
                </div>
              </CardContent>

            </Card>
          </Link>
        ))}       
        {filteredTasks.length === 0 && <p>No tasks found.</p>}
      </div>
    </div>
  );
};

export default TaskList;

