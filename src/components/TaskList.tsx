"use client";

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/components/Auth/AuthProvider';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getNearbyLocations, Location } from "@/services/location";
import { getFirestore, collection, getDocs } from "firebase/firestore";

interface Task {
  id?: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  category: string;
  userId: string;
}

const TaskList = () => {
  const { firestorePromises } = useAuth();
  const {app} = useFirebase();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [location, setLocation] = useState<Location>({ lat: 34.0522, lng: -118.2437 }); // Default to Los Angeles
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
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
          const tasksData = tasksSnapshot.docs.map((doc) => {
            const data = doc.data()
            return data ? { id: doc.id, ...data } as Task: null
          }).filter(task => task !== null) as Task[];
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
            <SelectValue placeholder="Filter by category" />
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
          <Card key={task.id}>
            <CardContent>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
              <div className="mt-2 flex items-center justify-between">
                <span>Budget: ${task.budget}</span>
                <span>Location: {task.location}</span>
              </div>
              <Button className="mt-4" onClick={() => router.push(`/task/${task.id}`)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
        {filteredTasks.length === 0 && <p>No tasks found.</p>}
      </div>
    </div>
  );
};

export default TaskList;

