
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getNearbyLocations, Location } from "@/services/location";

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  category: string;
}

const DUMMY_TASKS: Task[] = [
  {
    id: '1',
    title: 'Grocery Shopping',
    description: 'Pick up groceries from Whole Foods',
    location: 'Downtown',
    budget: 25,
    category: 'delivery',
  },
  {
    id: '2',
    title: 'House Cleaning',
    description: 'Clean my apartment',
    location: 'Midtown',
    budget: 50,
    category: 'cleaning',
  },
];

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [location, setLocation] = useState<Location>({ lat: 34.0522, lng: -118.2437 }); // Default to Los Angeles
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      // Call getNearbyLocations to get nearby locations
      const nearbyLocations = await getNearbyLocations(location);

      // For now, just use dummy tasks
      setTasks(DUMMY_TASKS);
    };

    fetchTasks();
  }, [location]);

  const filteredTasks = tasks.filter(task => {
    if (categoryFilter && task.category !== categoryFilter) {
      return false;
    }
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && !task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
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
        <Select onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
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
              <Button className="mt-4">View Details</Button>
            </CardContent>
          </Card>
        ))}
        {filteredTasks.length === 0 && <p>No tasks found.</p>}
      </div>
    </div>
  );
};

export default TaskList;
