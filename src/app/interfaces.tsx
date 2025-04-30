import { User } from "firebase/auth";

export interface UserAttr {
  fullName: string;
  role: string;
  bio: string;
  imageUrl: string;
};
export type ProfileType = User & UserAttr & { tasks: Task[] };

export interface Profile {
  profile: ProfileType;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    location: string;
    userId: string;
    budget: number;
    category: string;
    owner: ProfileType;
  }

export interface Request {
    id: string;
    message: string;
    senderId: string;
    reciverId: string;
    taskId: string;
    dateSend: string;
    dateRespond: string;
    status: string;
}