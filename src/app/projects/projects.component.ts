import { Component, OnInit } from '@angular/core';
import { Apollo } from "apollo-angular";
import { map } from "rxjs/operators";
import { sideNav } from "../../mat";

import { Project, Query, Mutation } from '../../api/types';
import { CacheService } from "../services";
import { projectsQuery, itemsQuery } from '../../api/queries';
import { addProjectMutation, deleteProjectMutation } from '../../api/mutations';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  constructor
    (
    private cache: CacheService,
    private apollo: Apollo
    ) { }

  profile: any
  projects: Project[] = []
  title: string = ''
  saving: boolean = false
  loading: boolean = true
  selectedProject: string = ''
  abort: boolean = false
  counts = {}

  ngOnInit() {
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
      )
      .subscribe(projects => {
        this.projects = projects
        projects.forEach(project => this.loadItemCount(project.id))
        this.loading = false
      })
  }

  loadItemCount(projectId) {
    this.apollo.query<Query>({
      query: itemsQuery,
      variables: {
        projectId
      }
    }).subscribe(t => this.counts[projectId] = t.data.items.length)
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

  deleteProject(id) {
    this.abort = true
    
    this.saving = true
    this.apollo.mutate<Mutation>({
      mutation: deleteProjectMutation,
      variables: {
        id: id
      },
      refetchQueries: [{
        query: projectsQuery,
        variables: {
          ownerId: this.profile.userId
        }
      }]
    }).subscribe(() => this.saving = false)
  }

  setSelectedProject(id) {
    if (this.abort) {
      this.abort = false
      return
    }    
    this.cache.setProject(id)
    this.selectedProject = id
  }
}
