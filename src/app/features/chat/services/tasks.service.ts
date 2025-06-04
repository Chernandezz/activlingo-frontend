// task.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../../core/models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  setTasks(tasks: Task[]): void {
    this.tasksSubject.next(tasks);
  }

  clear(): void {
    this.tasksSubject.next([]);
  }

  updateTaskCompleted(taskId: string): void {
    const updated = this.tasksSubject.value.map((t) =>
      t.id === taskId ? { ...t, completed: true } : t
    );
    this.tasksSubject.next(updated);
  }
}
