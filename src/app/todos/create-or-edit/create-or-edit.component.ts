import {Component, OnInit} from '@angular/core';

import {TodoApiService} from '../../services/todo-api.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ActivatedRoute, Router} from '@angular/router';
import {Todo} from '../../shared/dtos/responses/todos.dto';
import {ErrorAppResponse} from '../../shared/dtos/responses/base.dto';
import {NotificationService} from '../../shared/services/notification.service';


@Component({
  selector: 'app-create-or-edit',
  templateUrl: './create-or-edit.component.html',
  styleUrls: ['./create-or-edit.component.css']
})
export class CreateOrEditComponent implements OnInit {

  todo: Todo;
  private todoForm: FormGroup;
  isSubmitting = false;
  private submitted: boolean;

  constructor(private todoApiService: TodoApiService, private formBuilder: FormBuilder, private router: Router,
              private route: ActivatedRoute,
              private notificationService: NotificationService) {
    this.todoForm = this.formBuilder.group({
      title: [null, Validators.required],
      description: [null, Validators.required],
      completed: [null],
    });
  }

  ngOnInit() {

    const id = this.route.snapshot.params.id;

    if (id) {
      // edit mode
      this.todoApiService.getById(id).subscribe(res => {

        this.notificationService.dispatchSuccessMessage('Todo Fetched successfully');
        if ((res as Todo).id) {
          this.todo = res;
        }
        // patchValue vs setValue, setValue is for updating all controls, patchValue for updating only some,
        // leaving the rest untouched
        this.todoForm.patchValue({
          title: res.title,
          description: res.description,
          completed: res.completed
        });
      }, err => {
        this.notificationService.dispatchErrorMessage('Error');
      });
    }
  }

  update(): void {
    this.submitted = true;
    this.todoApiService.update(this.todo)
      .subscribe((res) => {
        if ((res as Todo).id) {
          this.notificationService.dispatchSuccessMessage('Todo updated successfully');
        }
      });
  }

  delete(): void {
    this.submitted = true;
    this.todoApiService.deleteById(this.todo.id)
      .subscribe((res) => {
        if (res.status === 204) {
          this.router.navigate(['/']);
          this.notificationService.dispatchSuccessMessage('Successfully deleted todo');
        }
      });
  }

  toggleDone() {
    this.todo.completed = !this.todo.completed;
    this.todoApiService.update(this.todo).subscribe(res => {
        if ((res as Todo).id) {
          this.todo = res as Todo;
        } else {
          // roll back the change
          this.todo.completed = !this.todo.completed;
        }
      },
      error => console.log(error));
  }

  create() {
    this.todoApiService.createTodo(this.todo).subscribe(res => {
      if (res.status === 201) {
        this.notificationService.dispatchSuccessMessage('Todo created');
        this.router.navigateByUrl('/');
      } else {
        this.notificationService.dispatchErrorMessage('Unknown error');
      }
    }, error => {
      debugger;
      console.log(error);
    });

  }

  createOrUpdateTodo() {
    this.isSubmitting = true;
    const newTodo = {} as Todo;

    newTodo.title = this.todoForm.value.title;
    newTodo.description = this.todoForm.value.description;
    // If the user has not touched the checkbox then it will be null
    newTodo.completed = this.todoForm.value.completed || false;


    if (this.todo) {
      newTodo.id = this.todo.id;
      this.todoApiService.update(newTodo).subscribe(res => {
        if ((res as Todo).id) {
          this.notificationService.dispatchSuccessMessage('Todo updated');
          this.todo = res as Todo;
          this.isSubmitting = false;
        } else {
          this.notificationService.dispatchErrorMessage('Error');
        }
      }, err => {
        this.isSubmitting = false;
      });
    } else {
      newTodo.completed = newTodo.completed || false;
      this.todoApiService.createTodo(newTodo).subscribe(res => {
        this.isSubmitting = false;
        if (res.status === 201) {
          this.notificationService.dispatchSuccessMessage('Todo created successfully');
          this.todo = (res.body as Todo);
        } else {
          // If something went wrong
          const errorResponse = (res.body as ErrorAppResponse);
          if (errorResponse.full_messages instanceof Array && errorResponse.full_messages.length > 0) {
            // If server returned message error
            this.notificationService.dispatchErrorMessage(errorResponse.full_messages[0]);
          } else {
            // If something went wrong but the server did not return a detailed message
            this.notificationService.dispatchErrorMessage('Unknown error');
          }
        }
      });
    }
  }

  goHome() {
    this.router.navigate(['/']);

  }
}
