"use client";

import ProfileDetails from '@/components/ProfileDetails';
import { notFound, useParams } from 'next/navigation';    
import { useAuth, useFirebase } from '@/components/Auth/AuthProvider';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from "next/navigation";
import NotFound from '@/app/not-found';
import { ProfileType, Task } from "@/app/interfaces";


const ProfileDetailPage = () => {
  const router = useRouter();
  const { uid: profileId } = useParams<{ uid: string }>();
  const { user } = useAuth();
  const { firestorePromises } = useAuth();
  const { app } = useFirebase();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [profileExist, setProfileExist] = useState<boolean>(true);
  // console.log(profileId)
  useEffect(() => {
    const fetchTask = async () => {
      if (!profileId || !app || !user) {
        router.push("/");
        return;
      }

      // if (profileId === user?.uid) {
      //   router.push("/profile");
      //   return;
      // }
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
        setProfile({ uid: profileSnap.id ?? '', ...profileSnap.data(), tasks: tasks } as ProfileType);
      }
      if (!profile) {
        setProfileExist(false);
      }
    };
    fetchTask();
  }, [profileId, app, firestorePromises]);
  return (
    <div>
      {profile && profile.uid ? <ProfileDetails profile={profile} /> : !profileExist && <NotFound/>}
    </div>
  );
};

export default ProfileDetailPage;