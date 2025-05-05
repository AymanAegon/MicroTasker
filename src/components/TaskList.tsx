"use client";

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/components/Auth/AuthProvider';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { Task } from "@/app/interfaces";

const TaskList:  React.FC<{tasks: Task[]} >= ({tasks}) => {
  const { firestorePromises } = useAuth();
  const {app} = useFirebase();
  const router = useRouter();
  // const [location, setLocation] = useState<Location>({ lat: 34.0522, lng: -118.2437 }); // Default to Los Angeles
  const [categoryFilter, setCategoryFilter] = useState('');
  // const [priceFilter, setPriceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

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

