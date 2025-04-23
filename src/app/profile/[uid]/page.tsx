"use client";

import ProfileDetails from '@/components/ProfileDetails';
import { useParams } from 'next/navigation';    
import { useAuth, useFirebase } from '@/components/Auth/AuthProvider';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface UserAttr {
  fullName: string;
  role: string;
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
      if (profileSnap.exists()) {
        setProfile({ uid: profileSnap.id ?? '', ...profileSnap.data() } as Profile);
      }
    };
    fetchTask();
  }, [profileId, app, firestorePromises]);
  return (
    <div>
      {profile && profile.uid ? <ProfileDetails profile={profile} /> : <p>Task not found</p>}
    </div>
  );
};

export default ProfileDetailPage;