import { clsx, type ClassValue } from "clsx"
import { Task } from "@/app/interfaces"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function makePopup(task: Task) {
  const text = task.title
  return text
}
export function makeCostumMarker(task: Task) {
  var el = document.createElement('div');
  // console.log(task.owner.imageUrl)
  el.className = 'marker';
  el.style.backgroundImage = `url(${task.owner.imageUrl})` ||
    `url(https://res.cloudinary.com/drmmom6jz/image/upload/v1746027479/Screenshot_from_2025-04-30_16-37-48_g58zzn.png)`;
  return el;
}