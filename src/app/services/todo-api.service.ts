import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';

import {BehaviorSubject, Observable} from 'rxjs';
import {Todo, TodoListDtoResponse} from '../shared/dtos/responses/todos.dto';
import {ErrorAppResponse} from '../shared/dtos/responses/base.dto';


@Injectable({
  providedIn: 'root'
})
export class TodoApiService {

  private readonly baseUrl: string;
  public cachedTodosData: TodoListDtoResponse = {} as TodoListDtoResponse;
  public todosObservable: BehaviorSubject<TodoListDtoResponse>;
  private readonly httpOptions: object;

  constructor(private httpClient: HttpClient) {
    this.baseUrl = 'http://localhost:8080/api/todos';
    this.todosObservable = new BehaviorSubject(this.cachedTodosData);


    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      })
    };
  }

  getAll(): Observable<Todo[] | ErrorAppResponse> {
    return this.httpClient.get<Todo[] | ErrorAppResponse>(`${this.baseUrl}`);
  }

  getCompleted(): Observable<Todo[] | ErrorAppResponse> {
    return this.httpClient.get<Todo[] | ErrorAppResponse>(`${this.baseUrl}/completed`);
  }

  getPending(): Observable<Todo[]> {
    return this.httpClient.get<Todo[]>(`${this.baseUrl}/pending`);
  }

  update(todo: Todo): Observable<Todo | ErrorAppResponse> {
    return this.httpClient.put<Todo | ErrorAppResponse>(`${this.baseUrl}/${todo.id}`, todo, this.httpOptions);
  }

  deleteAll(): Observable<HttpResponse<void | ErrorAppResponse>> {
    return this.httpClient.delete<void | ErrorAppResponse>(this.baseUrl, {observe: 'response'});
  }

  deleteById(id: number | string): Observable<HttpResponse<void | ErrorAppResponse>> {
    return this.httpClient.delete<void | ErrorAppResponse>(`${this.baseUrl}/${id}`, {
      ...this.httpOptions, observe: 'response'
    });
  }

  getById(id: number | string): Observable<Todo> {
    return this.httpClient.get<Todo>(`${this.baseUrl}/${id}`);
  }

  createTodo(todo: Todo): Observable<HttpResponse<Todo | ErrorAppResponse>> {
    return this.httpClient.post<Todo | ErrorAppResponse>(this.baseUrl, todo, {observe: 'response'});
  }
}
