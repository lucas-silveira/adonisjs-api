'use strict'

const Route = use('Route')

Route.post('users', 'UserController.store').validator('User')
Route.post('sessions', 'SessionController.store').validator('Session')
Route.post('forgot-password', 'ForgotPasswordController.store').validator('ForgotPassword')
Route.put('forgot-password', 'ForgotPasswordController.update').validator('ResetPassword')
Route.get('files/:id', 'FileController.show')

Route.group(() => {
  Route.post('files', 'FileController.store')

  Route.resource('projects', 'ProjectController')
    .apiOnly()
    .except(['index', 'show'])
    .validator(new Map(
      [
        [
          ['projects.store'], ['Project']
        ]
      ]
    )).middleware(['is:(administrator || moderator)'])

  Route.get('projects', 'ProjectController.index').middleware('can:read_projects')
  Route.get('projects/:id', 'ProjectController.show').middleware('can:read_projects')

  Route.resource('projects.tasks', 'TaskController').apiOnly().validator(new Map(
    [
      [
        ['projects.tasks.store'], ['Task']
      ]
    ]
  ))
}).middleware(['auth'])

Route.resource('permissions', 'PermissionController').apiOnly().middleware('auth')

Route.resource('roles', 'RoleController').apiOnly().middleware('auth')
