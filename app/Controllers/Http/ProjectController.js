'use strict'

const Project = use('App/Models/Project')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with projects
 */
class ProjectController {
  async index ({ request, auth }) {
    const { page } = request.get()

    const user = await auth.getUser()

    if (await user.can('read_private_projects')) {
      const projects = await Project.query()
        .with('user')
        .paginate(page)

      return projects
    }

    const projects = await Project.query()
      .where({ type: 'public' })
      .with('user')
      .paginate(page)

    return projects
  }

  async store ({ request, response, auth }) {
    const data = request.only(['title', 'description', 'type'])

    const project = await Project.create({ ...data, user_id: auth.user.id })

    return project
  }

  async show ({ params, auth, response }) {
    const user = await auth.getUser()
    const project = await Project.findOrFail(params.id)

    if (project.type !== 'public') {
      if (!(await user.can('read_private_projects'))) {
        return response.status(400).send({
          error: {
            message: 'Você não tem permissão de leitura.'
          }
        })
      }
    }

    await project.load('user')
    await project.load('tasks')

    return project
  }

  async update ({ params, request }) {
    const project = await Project.findOrFail(params.id)
    const data = request.only(['title', 'description'])

    project.merge(data)

    await project.save()

    return project
  }

  async destroy ({ params }) {
    const project = await Project.findOrFail(params.id)

    await project.delete()
  }
}

module.exports = ProjectController
