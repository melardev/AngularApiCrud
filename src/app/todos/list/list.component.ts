import {Component, OnInit} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {TodoApiService} from '../../services/todo-api.service';
import {Todo} from '../../shared/dtos/responses/todos.dto';
import {ErrorAppResponse} from '../../shared/dtos/responses/base.dto';
import {NotificationService} from '../../shared/services/notification.service';
import {HttpErrorResponse} from '@angular/common/http';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  private errors: any;
  todos: Todo[];

  constructor(private todosService: TodoApiService, private router: Router, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.todosService.getAll().subscribe(res => {
      if (res instanceof Array) {
        this.notificationService.dispatchSuccessMessage('Todos fetched successfully');
        this.todos = res;
      }
    }, err => {
      this.notificationService.dispatchErrorMessage(`An error occurred ${err}`);
    });
  }

  edit(id: number) {
    this.todosService.getById(id).subscribe(res => {
      if (res.id) {
        const returnedTodo = {...res};
        this.todos = this.todos.map(todo => todo.id === returnedTodo.id ? returnedTodo : todo);
        this.notificationService.dispatchSuccessMessage('Todo updated successfully');
      } else {
        this.notificationService.dispatchSuccessMessage('Unknown error');
      }
      return res;
    });
  }

  toggleComplete(todo: Todo) {
    this.todosService.update({...todo, completed: !todo.completed}).subscribe(response => {
      if ((response as Todo).id) {
        // this.notificationService.dispatchSuccessMessage('Todo updated successfully');
        if (this.todos) {
          this.todos = this.todos.map(t => t.id === todo.id ? (response as Todo) : t);
        }
      } else {
        this.notificationService.dispatchErrorMessage('Something went wrong');
      }
    });
  }

  deleteAll() {
    this.todosService.deleteAll()
      .subscribe(
        res => {
          if (res.status === 204) {
            this.notificationService.dispatchSuccessMessage('Todos deleted successfully');
          } else {
            this.notificationService.dispatchErrorMessage('Error');
          }
        },
        error => this.errors = [{error}]
      );
  }

  deleteTodo(todo) {
    this.todosService.deleteById(todo.id).subscribe(res => {
      if (res.status === 204/* 204 -> No content status code */) {
        this.todos = this.todos.filter(t => t.id !== todo.id);
        this.notificationService.dispatchSuccessMessage('Todo deleted successfully');
      }
    }, err => {
      this.notificationService.dispatchErrorMessage(err);
    });
  }

  returnError(err): Observable<ErrorAppResponse> {
    if (err instanceof HttpErrorResponse) {
      const response = new ErrorAppResponse();
      response.full_messages = [`Local error, details: ${err.message} `];
      return of(response);
    } else if (err instanceof String) {
      const response = new ErrorAppResponse();
      response.full_messages = [`Local error, details: ${err} `];
      return of(response);
    } else {
      debugger;
      return throwError(err);
    }
  }
}
