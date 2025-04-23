
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, Fragment } from "react";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { User } from "firebase/auth";
interface UserAttr {
  fullName: string;
  role: string;
};

type ProfileType = User & UserAttr;
interface Profile {
  profile: ProfileType;
}

const ProfileDetails = ({ profile }: Profile) => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
    <div key={refreshKey} className="flex flex-col justify-center items-center py-10 bg-secondary gap-4 w-full min-h-screen">
      <div className="w-full max-w-2xl px-4">
        <Link href="/" className="flex items-center text-blue-500 hover:underline mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <Card className="w-full">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-3xl font-bold">
              {profile.fullName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <div className="grid gap-2">
                <div className="text-gray-600">
                  {profile.role === "taskPoster" ? "Task Poster" : "Tasker"}
                </div>
                {/* <div className="flex flex-col gap-y-1">
                <span className="font-semibold">Category:</span>
                <span className="text-gray-600">{task.category}</span>
                </div> */}
            </div>
          </CardContent>
        </Card>        
      </div>
    </div>
    </>
    
  );
};

export default ProfileDetails;
