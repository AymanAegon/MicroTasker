
import TaskList from '@/components/TaskList';

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Nearby Tasks</h1>
      <TaskList />
    </div>
  );
}

