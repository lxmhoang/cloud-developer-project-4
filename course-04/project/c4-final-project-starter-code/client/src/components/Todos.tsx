import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Container,
  Select,
  GridColumn,
} from 'semantic-ui-react'
import { GetTodoReq } from '../types/GetTodoReq'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

const LIMITS = [
  { key: '3', value: 3, text: '3 itmss per page' },
  { key: '6', value: 6, text: '6 items per page' },
  { key: '9', value: 9, text: '9 items per page' }
]


interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean,
  param: GetTodoReq,
  nextKeyArr: string[]
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    param: { nextKey: '', limit : 3},
    nextKeyArr: []
  
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      this.setState({
        loadingTodos: true,
        newTodoName: '',
        nextKeyArr: [],         
        param: {
          ...this.state.param,
          nextKey: ''
        }
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo check failed')
    }
  }
  onClickNextButton() {
    this.state.nextKeyArr.push(this.state.param.nextKey);
    this.setState({ loadingTodos: true });
  }

  onClickPreviousButton() {
    this.state.nextKeyArr.pop();
    this.setState({        
      param: {
        ...this.state.param,
        nextKey: this.state.nextKeyArr.at(-1) || ''
      }, 
      loadingTodos: true });
  }

  onChangeLimit = (newLimit: number) => {
    this.setState({ 
      loadingTodos: true,
      nextKeyArr: [], 
      param: {
        ...this.state.param,
        limit: newLimit,
        nextKey: ''
      }
    });
  }

  async getTodos() {
    try {
      const result = await getTodos(this.props.auth.getIdToken(), this.state.param);
      this.setState({
        todos: result.items,
        param: {
          ...this.state.param,
          nextKey: result.nextKey ?? '',
        },
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  async componentDidMount() {
    await this.getTodos();
  }

  async componentDidUpdate(prevProps: any, prevState: TodosState) {
    if (this.state.loadingTodos !== prevState.loadingTodos && this.state.loadingTodos) {
      await this.getTodos();
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateTodoInput()}
        {this.renderPagingComp()}

        {this.renderTodos()}
      </div>
    )
  }

  renderPagingComp() {
    return (
      <Container style={{ paddingBottom: '15px', textAlign: 'right' }}>          
          <Button primary
                  content='Previous'
                  icon='left arrow'
                  labelPosition='left'
                  loading={this.state.loadingTodos}
                  onClick={() => this.onClickPreviousButton()}
                  disabled={(this.state.nextKeyArr.length === 0)} />
          <Button primary
                  content='Next'
                  icon='right arrow'
                  labelPosition='right'
                  loading={this.state.loadingTodos}
                  onClick={() => this.onClickNextButton()}
                  disabled={(this.state.param.nextKey === null || this.state.param.nextKey === '')} />
          <Select placeholder='Page size' 
                  style={{ marginRight: '10px' }} 
                  options={LIMITS} 
                  value={this.state.param.limit} 
                  onChange={(e, data) => this.onChangeLimit(Number(data.value))}
                   />
      </Container>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
                <GridColumn>{todo.attachmentUrl && (
                  <Image src={todo.attachmentUrl} size="large"  />
                )}
                </GridColumn>

              <Grid.Column width={2} verticalAlign="middle">
                {todo.done ? 'Done' : 'Not Yet'}<br/>
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle"  textAlign="left">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle" textAlign="left"> 
                {todo.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right"  verticalAlign="middle" >
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right"  verticalAlign="middle" >
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              
              {/* <Grid.Column width={16}>
                <Divider />
              </Grid.Column> */}
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
