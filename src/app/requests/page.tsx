
"use client";

import { useAuth, useFirebase } from '@/components/Auth/AuthProvider';
import { Request, Task, ProfileType } from '@/app/interfaces';
import { useEffect, useState } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { doc, collection, query, where, getDocs, getDoc, updateDoc } from "firebase/firestore"; // Added updateDoc
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button"; // Added Button

import { format } from 'date-fns';
// Updated RequestType to include receiver details if needed, though not strictly necessary for this logic
type RequestType = Request & {task: Task, sender: ProfileType, reciver: ProfileType};

export default function RequestsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const { firestorePromises, user } = useAuth();
  const { app } = useFirebase();
  const router = useRouter();

  const [requests, setRequests] = useState<RequestType[]>([]);

  useEffect(() => {
     if (!user) {
      router.push('/login');
      return; // Early return if user is not logged in
    }
    const fetchRequests = async () => {
      const { getFirestore } = await firestorePromises;
      const db = getFirestore(app);
      // Ensure user.uid is available before querying
      if (!user.uid) return;
      const q = query(collection(db, "requests"), where("reciverId", "==", user.uid));

      const querySnapshot = await getDocs(q);

      // Use Promise.all to fetch related data concurrently
      const arrPromises = querySnapshot.docs.map(async (reqDoc) => {
        const reqData = reqDoc.data();
        // Ensure task, sender, and receiver data can be fetched before creating the object
        const taskRef = doc(db, "tasks", reqData.taskId);
        const taskSnap = await getDoc(taskRef);

        const senderRef = doc(db, "users", reqData.senderId);
        const senderSnap = await getDoc(senderRef);

        const reciverRef = doc(db, "users", reqData.reciverId);
        const reciverSnap = await getDoc(reciverRef);

        // Return null or a default structure if related data doesn't exist, or handle appropriately
        if (!taskSnap.exists() || !senderSnap.exists() || !reciverSnap.exists()) {
          console.warn(`Missing related data for request ${reqDoc.id}`);
          return null; // Or handle this case as needed
        }

        return {
          id: reqDoc.id,
          ...reqData,
          task: { id: taskSnap.id, ...taskSnap.data() } as Task, // Include task ID
          sender: { uid: senderSnap.id, ...senderSnap.data() } as ProfileType, // Include sender UID
          reciver: { uid: reciverSnap.id, ...reciverSnap.data() } as ProfileType, // Include receiver UID
        } as RequestType;
      });

      const arr = (await Promise.all(arrPromises)).filter(Boolean) as RequestType[]; // Filter out nulls
      setRequests(arr);
    };
    fetchRequests();
  }, [app, firestorePromises, user?.uid, router, refreshKey]); // Added user?.uid, router, refreshKey


  // Function to handle accepting or rejecting a request
  const handleRequestUpdate = async (requestId: string, status: 'accepted' | 'rejected') => {
    const { getFirestore, doc, updateDoc } = await firestorePromises;
    const db = getFirestore(app);
    const requestRef = doc(db, "requests", requestId);
    try {
      await updateDoc(requestRef, { status: status, dateRespond: new Date().toString() });
      setRefreshKey(prev => prev + 1); // Trigger a re-fetch to update the UI
    } catch (err) {
      console.error("Error updating request:", err);
      // Optionally, show an error message to the user
    }
  };


  const filteredRequests = requests.filter(request => {
    // Added checks for request.task existence
    if (!request.task) return false;
    if (categoryFilter && categoryFilter !== 'all' && request.task.category !== categoryFilter) {
      return false;
    }
    if (searchTerm && !request.task.title.toLowerCase().includes(searchTerm.toLowerCase()) && !request.task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
     if (locationFilter && !request.task.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div key={refreshKey} className="flex flex-col justify-center items-center py-10 bg-secondary gap-4 w-full min-h-screen">
      <div className="w-full max-w-5xl px-4">
        <Link href="/" className="flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <Card className="w-full">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold">
                  Your Requests
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <div className="grid gap-2">
              Total requests: {requests.length}
            </div>
            <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                 className="flex-grow"
              />
              <Select onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
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
              {filteredRequests.map(request => (
                 // Use Card instead of Link as the main container for layout flexibility
                 <Card key={request.id} className="relative hover:shadow-md transition-shadow flex flex-col md:flex-row">
                  <CardContent className="p-4 flex-grow">
                    <Link href={`/task/${request.taskId}`} className="no-underline">
                      <CardTitle className="text-lg font-medium mb-2 hover:underline text-primary">{request.task.title}</CardTitle>
                    </Link>
                    <div className="mb-2">
                      <p className="font-semibold">From:
                         <Link href={`/profile/${request.sender.uid}`} className="ml-1 text-primary hover:underline">
                            {request.sender.fullName}
                          </Link>
                      </p>
                    </div>
                    <div>
                      <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                        {request.task.description}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                       <p className="mb-1">Message: {request.message !== "" ? request.message : "No Message"}</p>
                    </div>
                     <div className="flex flex-col space-y-1 mt-2">
                       <span className="font-semibold">Budget: ${request.task.budget}</span>
                       <span className="text-xs">Requested: {format(new Date(request.dateSend), 'dd/MM/yyyy HH:mm')}</span>
                       {request.dateRespond && <span className="text-xs">Responded: {format(new Date(request.dateRespond), 'dd/MM/yyyy HH:mm')}</span>}
                     </div>
                     <div className='mt-2'>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          request.status === 'canceled' ? 'bg-gray-100 text-gray-800' : // Added Canceled status style
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)} {/* Capitalize status */}
                      </span>
                     </div>
                  </CardContent>
                   {/* Buttons section - only show if status is pending */}
                   {request.status === 'pending' && (
                    <div className="flex flex-col justify-center items-center gap-2 p-4 border-t md:border-t-0 md:border-l border-border">
                      <Button
                        onClick={() => handleRequestUpdate(request.id, 'accepted')}
                        variant="default"
                        size="lg" // Increased size
                        className="w-full md:w-auto px-6 py-3" // Adjusted padding for bigger size
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRequestUpdate(request.id, 'rejected')}
                        variant="destructive"
                        size="lg" // Increased size
                        className="w-full md:w-auto px-6 py-3" // Adjusted padding for bigger size
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                 </Card>
              ))}
               {filteredRequests.length === 0 && <p className="text-center text-muted-foreground mt-4">No requests found matching your criteria.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    