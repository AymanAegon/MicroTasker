"use client";

import TaskDetails from '@/components/TaskDetails';
import { useParams } from 'next/navigation';    
import { useAuth, useFirebase } from '@/components/Auth/AuthProvider';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { User } from "firebase/auth";
interface UserAttr {
  fullName: string;
  role: string;
};

type Owner = User & UserAttr;

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  category: string;
  userId: string;
  owner: Owner;
}

const TaskDetailPage = () => {
  const { id: taskId } = useParams();
  const { firestorePromises } = useAuth();
  const { app } = useFirebase();
  const [task, setTask] = useState<Task | null>(null);
  
  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId || !app) return;
      const { getFirestore } = await firestorePromises;
      const db = getFirestore(app);
      const taskDoc = doc(db, 'tasks', taskId as string);
      const taskSnap = await getDoc(taskDoc);
      const taskData = taskSnap.data();
      const taskOwnerDocRef = doc(db, "users", taskData?.userId);
      const taskOwnerSnapshot = await getDoc(taskOwnerDocRef);
      if (taskSnap.exists()) {
        setTask({id: taskSnap.id, ...taskData, owner: taskOwnerSnapshot.data() } as Task);
      }
    };
    fetchTask();
  }, [taskId, app, firestorePromises]);

  return (
      <div>
        {task && task.id ? <TaskDetails task={task} /> : <p>Task not found</p>}
      </div>
  );
};


export default TaskDetailPage;