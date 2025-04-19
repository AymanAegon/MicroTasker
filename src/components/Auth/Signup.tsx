
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { createUser, signInWithGoogle, firestorePromises } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createUser(email, password);
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const { getFirestore, doc } = await firestorePromises;
        const db = getFirestore();
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email || '',
          fullName: fullName || '',
        });
      } else {
        console.error("user not found after signup");
        setError("user not found after signup");
      }
    }
     catch (err: any) {
      setError(err.message);
    }
      router.push('/role-select');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-secondary">
      <Card className="w-full max-w-md">
        
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
          <CardDescription className="text-center">Create an account to get started</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Sign Up
            </Button>
          </form>
          {/*<div className="text-center text-sm">
            Or
          </div>
          <Button variant="outline" className="w-full" onClick={() => signInWithGoogle()}>
            Sign Up with Google
          </Button>*/}
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-blue-500 hover:underline">
              Already have an account? Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
