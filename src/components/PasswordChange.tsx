
"use client";

import { EmailAuthProvider, getAuth, updatePassword, reauthenticateWithCredential, validatePassword } from "firebase/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const PasswordChange = ({ closeDialog }: { closeDialog: () => void }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const status = await validatePassword(getAuth(), oldPassword);
    if (!status.isValid) {
      alert("Invalid password!");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 1. Re-authenticate the user with their current password
      const credential = EmailAuthProvider.credential(
        user.email ?? '',
        oldPassword
      );
      await reauthenticateWithCredential(user, credential);
      // 2. Update the password after successful re-authentication
      await updatePassword(user, newPassword);

      // 3. Success!
      alert('Password changed!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      closeDialog();
      console.log('Password changed!');
    } catch (error: any) {
      // Handle Errors
      if (error.code === 'auth/invalid-credential') {
        alert('Incorrect password.');
      } else if (error.code === 'auth/requires-recent-login') {
        alert('Please sign in again to update your password.');
        // You might want to redirect the user to the login page here
      } else {
        console.error('Error updating password:', error);
      }
    }

  };

  return (
    <div className="flex justify-center items-center py-0 bg-secondary">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Make sure to choose a strong password!</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleSubmit} className="grid gap-4">    
            <div className="grid gap-2">
              <Label htmlFor="title">Old password</Label>
              <Input
                type="password"
                id="old-pass"
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Old password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">New password</Label>
              <Input
                type="password"
                id="new-pass1"
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Confirm password</Label>
              <Input
                type="password"
                id="new-pass2"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="New password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Change
            </Button>
          </form>
          <Button variant={"outline"} onClick={closeDialog} className="w-full">
           Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordChange;

