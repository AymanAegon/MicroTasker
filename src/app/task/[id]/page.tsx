"use client";

import TaskDetails from '@/components/TaskDetails';
import { useParams } from 'next/navigation';    
import { useAuth, useFirebase } from '@/components/Auth/AuthProvider';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  category: string;
  userId: string;
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
      if (taskSnap.exists()) {
        setTask({ id: taskSnap.id ?? '', ...taskSnap.data() } as Task);
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