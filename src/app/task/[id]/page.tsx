"use client";

import TaskDetails from '@/components/TaskDetails';
import { useParams } from 'next/navigation';

// Import the DUMMY_TASKS array here (or ideally, fetch from your data source)
const DUMMY_TASKS = [
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

const TaskDetailPage = () => {
  const { id } = useParams();

  // In a real app, you'd fetch the task from your database here
  const task = DUMMY_TASKS.find((t) => t.id === id as string);

  if (!task) {
    return <p>Task not found</p>;
  }

  return (
    <div>
      <TaskDetails task={task} />
    </div>
  );
};

export default TaskDetailPage;