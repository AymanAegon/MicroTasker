
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  category: string;
}

interface TaskDetailsProps {
  task: Task;
}

const TaskDetails = ({ task }: TaskDetailsProps) => {
  const handleAcceptTask = () => {
    alert(`Task "${task.title}" accepted!`);
  };

  return (
    <div className="flex justify-center items-center py-10 bg-secondary">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <CardDescription>{task.description}</CardDescription>
          <div className="grid gap-2">
            <p>Location: {task.location}</p>
            <p>Budget: ${task.budget}</p>
            <p>Category: {task.category}</p>
          </div>
          <Button onClick={handleAcceptTask} className="w-full">
            Accept Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetails;
