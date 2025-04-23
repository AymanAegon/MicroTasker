"use client";

import ProfileDetails from '@/components/ProfileDetails';
import { notFound, useParams } from 'next/navigation';    
import { useAuth, useFirebase } from '@/components/Auth/AuthProvider';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import NotFound from '@/app/not-found';

type Task = {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  category: string;
  userId: string;
}

interface UserAttr {
  fullName: string;
  role: string;
  tasks: Task[];
};

type Profile = User & UserAttr;

const ProfileDetailPage = () => {
  const router = useRouter();
  const { uid: profileId } = useParams<{ uid: string }>();
  const { user } = useAuth();
  const { firestorePromises } = useAuth();
  const { app } = useFirebase();
  const [profile, setProfile] = useState<Profile | null>(null);
  // console.log(profileId)
  useEffect(() => {
    const fetchTask = async () => {
      if (!profileId || !app) {
        router.push("/");
        return;
      }

      if (profileId === user?.uid) {
        router.push("/profile");
        return;
      }
      const { getFirestore } = await firestorePromises;
      const db = getFirestore(app);
      const profileDoc = doc(db, 'users', profileId as string);
      const profileSnap = await getDoc(profileDoc);

      let tasks = [] as Task[];
      const tasksCollection = collection(db, "tasks");
      const tasksSnapshot = await getDocs(tasksCollection);
      tasksSnapshot.forEach((doc) => {
        if (doc.data().userId === profileId) {
          tasks.push({ id: doc.id, ...doc.data() } as Task);
        }
      });
      // console.log(tasks);
      if (profileSnap.exists()) {
        setProfile({ uid: profileSnap.id ?? '', ...profileSnap.data(), tasks: tasks } as Profile);
      }
      if (!profile) {
        notFound();
      }
    };
    fetchTask();
  }, [profileId, app, firestorePromises]);
  return (
    <div>
      {profile && profile.uid ? <ProfileDetails profile={profile} /> : <NotFound/>}
    </div>
  );
};

export default ProfileDetailPage;