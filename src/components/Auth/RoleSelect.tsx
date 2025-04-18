
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "./AuthProvider";
import { getAuth } from "firebase/auth";

const RoleSelect = () => {
  const { updateUser } = useAuth();
  const [role, setRole] = useState('');
  const router = useRouter();

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      const userId = getAuth().currentUser?.uid;
      if (userId) {
        await updateUser(userId, { role });
        router.push("/");
      }
    }

  };

  return (
    <div className="flex justify-center items-center h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Select Your Role</CardTitle>
          <CardDescription className="text-center">Choose whether you will be posting tasks or completing them.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Button
                variant={role === 'taskPoster' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => handleRoleSelect('taskPoster')}
              >
                Task Poster
              </Button>
              <Button
                variant={role === 'tasker' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => handleRoleSelect('tasker')}
              >
                Tasker
              </Button>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={!role}>
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelect;
