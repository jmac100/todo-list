import { Injectable } from '@angular/core';

@Injectable()
export class CacheService {

  constructor() { }

  profile: any

  getProfile() {
    return JSON.parse(localStorage.getItem("todos-profile"))
  }

  setProfile(profile) {
    localStorage.setItem('todos-profile', JSON.stringify(profile))
  }

  onLogout() {
    localStorage.removeItem('todos-profile')
  }

  getProject() {
    let project = localStorage.getItem('todos-project')
    return project ? project : ""
  }

  setProject(project) {
    localStorage.setItem('todos-project', project)
  }
}
