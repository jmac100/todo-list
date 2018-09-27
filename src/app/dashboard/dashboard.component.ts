import { Component, Inject, OnInit, AfterViewChecked, AfterViewInit } from '@angular/core';
import { DOCUMENT} from '@angular/common';
import { Apollo } from "apollo-angular";
import { map } from "rxjs/operators";
import * as moment from 'moment';
import { PageScrollService, PageScrollInstance } from 'ngx-page-scroll';


import { CacheService } from "../services";
import { 
  sideNav, 
  collapse, 
  resizeTextArea, 
  select,
  datePicker,
  setDate,
  tooltip,
  modal } from "../../mat";
import { _ } from 'underscore';

import { Item, Query, Mutation, Project } from "../../api/types";
import { itemsQuery, projectsQuery } from "../../api/queries";
import {
  addItemMutation,
  editItemMutation,
  deleteItemMutation,
  updateOrdinalMutation,
  addProjectMutation
} from "../../api/mutations";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewChecked, AfterViewInit {
  profile: any
  todos: Item[] = []
  projects: Project[] = []
  item: string
  loading: boolean = true
  saving: boolean = false
  options: any
  editId: string = ''
  selectedProject: string = ''
  action: string = ''
  todo: Item = null
  title: string = ''
  counts = {}

  constructor
    (
      private apollo: Apollo,
      private cache: CacheService,
      private pageScrollService: PageScrollService, 
      @Inject(DOCUMENT) private document: any
    ) {}


  ngAfterViewChecked() {
    collapse()
  }

  ngAfterViewInit() {
    this.initMatComponents()
  }

  initMatComponents(){
    setTimeout(() => {
      this.todos.forEach(todo => {
        resizeTextArea(todo.id)
        datePicker(todo.id)
        tooltip(`tip${todo.id}`)
        tooltip(`copy${todo.id}`)
        tooltip(`move${todo.id}`)
        modal()
      })
    }, 500);
  }

  ngOnInit() {
    this.options = {
      onUpdate: (event: any) => {
        const id = event.item.id
        const indexDiff = event.newIndex - event.oldIndex
        const currentOrdinal = _.findWhere(this.todos, { id }).ordinal
        const newOrdinal = currentOrdinal + indexDiff

        this.updateOrdinal(id, newOrdinal, indexDiff < 0)
      }
    }

    sideNav()

    this.profile = this.cache.getProfile()
    this.selectedProject = this.cache.getProject()

    this.apollo.watchQuery<Query>({
      query: projectsQuery,
      variables: {
        ownerId: this.profile.userId
      }
    })
      .valueChanges
      .pipe(
        map(res => res.data.projects)
      ).subscribe(projects => {
        this.projects = projects

        projects.forEach(project => this.loadItemCount(project.id))

        if (this.projects.length === 0) {
          this.cache.setProject('')
          this.selectedProject = ''
          this.apollo.mutate<Mutation>({
            mutation: addProjectMutation,
            variables: {
              title: 'General',
              ownerId: this.profile.userId
            },
            refetchQueries: [{
              query: projectsQuery,
              variables: {
                ownerId: this.profile.userId
              }
            }]
          }).subscribe(res => {
            this.cache.setProject(res.data.addProject.id)
            this.selectedProject = this.cache.getProject()      
            this.loadItems() 
          });
        } else {
          if (this.selectedProject === '') {
            if (this.projects.length > 0){
              this.cache.setProject(this.projects[0].id.toString())
              this.selectedProject = this.cache.getProject()
            }
          }
          this.loadItems()
        }
      })    
  }

  loadItemCount(projectId) {
    this.apollo.query<Query>({
      query: itemsQuery,
      variables: {
        projectId
      }
    }).subscribe(t => {
      this.counts[projectId] = t.data.items.length
    })
  }

  loadItems() {
    this.apollo.watchQuery<Query>({
      query: itemsQuery,
      variables: {
        projectId: this.selectedProject
      }
    })
      .valueChanges
      .pipe(
        map(res => res.data.items)
      )
      .subscribe(t => {
        this.todos = t        
        this.loading = false
        select()

        this.todos.forEach(todo => {
          setDate(todo.id, todo.dueDate)
        })
      })
  }

  selectedProjectChanged() {
    this.loading = true
    this.cache.setProject(this.selectedProject)
    this.loadItems()
    this.initMatComponents()
  }

  updateOrdinal(id, ordinal, up) {
    this.saving = true
    this.apollo.mutate<Mutation>({
      mutation: updateOrdinalMutation,
      variables: {
        id: id,
        projectId: this.selectedProject,
        newOrdinal: ordinal,
        up: up
      },
      refetchQueries: [{
        query: itemsQuery,
        variables: {
          projectId: this.selectedProject
        }
      }]
    }).subscribe(() => {
      this.saving = false
      this.initMatComponents()
    })
  }

  addItem() {

    if (!this.item) return

    this.saving = true
    const newOrdinal = this.todos.length ? _.sortBy(this.todos, 'ordinal').reverse()[0].ordinal + 1 : 1

    this.apollo.mutate<Mutation>({
      mutation: addItemMutation,
      variables: {
        title: this.item,
        notes: '',
        complete: false,
        ordinal: newOrdinal,
        ownerId: this.profile.userId,
        projectId: this.selectedProject,
        dueDate: ''
      },
      refetchQueries: [{
        query: itemsQuery,
        variables: {
          projectId: this.selectedProject
        }
      }]
    }).subscribe(() => {
      this.item = ''
      this.saving = false
      this.initMatComponents();
      this.scrollToBottom()
      this.counts[this.selectedProject] += 1
    })
  }

  toggleEditMode(id) {
    this.editId = id
  }

  setTodoComplete(todo) {
    if (this.editId) return

    this.saving = true
    this.apollo.mutate<Mutation>({
      mutation: editItemMutation,
      variables: {
        id: todo.id,
        complete: !todo.complete
      },
      refetchQueries: [{
        query: itemsQuery,
        variables: {
          projectId: this.selectedProject
        }
      }]
    }).subscribe(() => this.saving = false)
  }

  edit(id, notes, dueDate) {   
    this.saving = true
    this.apollo.mutate<Mutation>({
      mutation: editItemMutation,
      variables: {
        id: id,
        notes: notes,
        dueDate: dueDate
      },
      refetchQueries: [{
        query: itemsQuery,
        variables: {
          projectId: this.selectedProject
        }
      }]
    }).subscribe(() => {
      this.saving = false
      this.initMatComponents()
    })
  }

  editTodo(id, title) {
    this.saving = true
    this.apollo.mutate<Mutation>({
      mutation: editItemMutation,
      variables: {
        id,
        title
      },
      refetchQueries: [{
        query: itemsQuery,
        variables: {
          projectId: this.selectedProject
        }
      }]
    }).subscribe(() => {
      this.saving = false
      this.toggleEditMode(0)
    })
  }

  delete(todo) {
    this.saving = true
    this.apollo.mutate<Mutation>({
      mutation: deleteItemMutation,
      variables: {
        id: todo.id,
        projectId: this.selectedProject,
        ordinal: todo.ordinal
      },
      refetchQueries: [{
        query: itemsQuery,
        variables: {
          projectId: this.selectedProject
        }
      }]
    }).subscribe(() => {
      this.counts[this.selectedProject] -= 1
      this.saving = false
    })
  }

  getAlarmColor(todo) {
    const diff = moment(todo.dueDate, 'MM-DD-YYYY').diff(moment(new Date(), 'MM-DD-YYYY'), 'days')
    if (diff > 5) {
      return 'green-text'
    } else if (diff >= 2) {
      return 'yellow-text'
    } else {
      return 'red-text'
    }
  }

  scrollToBottom() {
    let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, '#scrollTarget');
    this.pageScrollService.start(pageScrollInstance);
  }

  setAction(action, todo) {
    this.action = action
    this.todo = todo
  }

  execAction(projectId) {
    this.saving = true
    this.apollo.query<Query>({
      query: itemsQuery,
      variables: {
        projectId
      }
    }).subscribe(res => {
      const ordinal = res.data.items.length ? _.sortBy(res.data.items, 'ordinal').reverse()[0].ordinal + 1 : 1
      if (this.action === 'Copy' || this.action === 'Move') {
        this.copy(ordinal, projectId)
        if (this.action === 'Move') {
          this.delete(this.todo)
        }
      }
      window.location.href = '/todos'
    })
  }

  copy(ordinal, projectId) {
    this.apollo.mutate<Mutation>({
      mutation: addItemMutation,
      variables: {
        title: this.todo.title,
        notes: this.todo.notes,
        complete: false,
        ordinal: ordinal,
        ownerId: this.profile.userId,
        projectId: projectId,
        dueDate: this.todo.dueDate
      }
    }).subscribe()
  }

  move(ordinal, projectId) {
    this.apollo.mutate<Mutation>({
      mutation: editItemMutation,
      variables: {
        id: this.todo.id,
        ordinal,
        projectId
      }
    }).subscribe()
  }

  addProject() {
    this.apollo.mutate<Mutation>({
      mutation: addProjectMutation,
      variables: {
        title: this.title,
        ownerId: this.profile.userId
      },
      refetchQueries: [{
        query: projectsQuery,
        variables: {
          ownerId: this.profile.userId
        }
      }]
    }).subscribe(() => this.title = '')
  }

  getProjects() {
    return this.projects.filter(project => project.id !== this.selectedProject)
  }
}
