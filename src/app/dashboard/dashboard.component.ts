import { Component, OnInit, AfterViewChecked, AfterViewInit } from '@angular/core';
import { Apollo } from "apollo-angular";
import { map } from "rxjs/operators";
import { Observable } from "rxjs/Observable";
import { CacheService } from "../services";
import { sideNav, collapse, resizeTextArea, select } from "../../mat";
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

  constructor
    (
    private apollo: Apollo,
    private cache: CacheService
    ) { }

  profile: any
  todos: Item[] = []
  projects: Project[] = []
  item: string
  loading: boolean = true
  saving: boolean = false
  options: any
  editId: string = ''
  selectedProject: string = ''

  ngAfterViewChecked() {
    collapse()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.todos.forEach(todo => {
        resizeTextArea(todo.id)
      })
      select()
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
            select()     
          });
        } else {
          if (this.selectedProject === '') {
            if (this.projects.length > 0){
              this.cache.setProject(this.projects[0].id.toString())
              this.selectedProject = this.cache.getProject()
              select()
            }
          }
          this.loadItems()
        }
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
      })
  }

  selectedProjectChanged() {
    this.cache.setProject(this.selectedProject)
    this.loadItems()
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
    }).subscribe(() => this.saving = false)
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
        projectId: this.selectedProject
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

  edit(id, notes) {
    this.saving = true
    this.apollo.mutate<Mutation>({
      mutation: editItemMutation,
      variables: {
        id: id,
        notes: notes
      },
      refetchQueries: [{
        query: itemsQuery,
        variables: {
          projectId: this.selectedProject
        }
      }]
    }).subscribe(() => this.saving = false)
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
    }).subscribe(() => this.saving = false)
  }
}
