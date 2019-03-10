import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TodoApiService} from '../../services/todo-api.service';
import {Todo} from '../../shared/dtos/responses/todos.dto';
import {NotificationService} from '../../shared/services/notification.service';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  todo: Todo;

  constructor(private todoApiService: TodoApiService, private notificationService: NotificationService, private route: ActivatedRoute) {

  }

  ngOnInit() {

    // this.route.snapshot.paramMap.get('id');
    // this.route.snapshot.params.id
    this.route.params.subscribe(params => {
      const id = params.id;

      if (id) {
        this.todoApiService.getById(id)
          .subscribe(res => {
            if ((res as Todo)) {
              this.notificationService.dispatchSuccessMessage('Todo fetched successfully');
              this.todo = res;
            }
          }, err => {
            // this should never happen because the service will always return an Observable even on error.
            debugger;
          });
      }
    });
  }


}
