import { Plugin, WorkspaceLeaf } from 'obsidian'
import { PropertiesView } from './views/PropertiesView'
import { configureMinimalWorkspace, cleanupWorkspace } from './ui/workspace'
import { VIEW_TYPE_BLOG, VIEW_TYPE_PROPERTIES } from './types'
import { ExampleView, VIEW_TYPE_EXAMPLE } from './views/ExampleView'
import { JequillSettingTab } from './settings'
import { PostsView, VIEW_TYPE_POSTS } from './views/PostsView'

interface JequillPluginSettings {
  enableMinimalWorskpace: boolean
}

const DEFAULT_SETTINGS: Partial<JequillPluginSettings> = {
  enableMinimalWorskpace: false,
}

export default class JequillPlugin extends Plugin {
  settings!: JequillPluginSettings

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  async onload() {
    await this.loadSettings()

    this.addSettingTab(new JequillSettingTab(this.app, this))

    this.registerView(
      VIEW_TYPE_POSTS,
      (leaf) => new PostsView(leaf)
    )

    this.registerView(
      VIEW_TYPE_PROPERTIES,
      (leaf) => new PropertiesView(leaf, this)
    )

    this.addRibbonIcon('newspaper', 'Jequill', () => {
      this.activatePostsView()
    })

    this.app.workspace.onLayoutReady(this.loadLayout)

    this.registerEvent(
      this.app.vault.on('create', () => {
        this.refreshViews()
      })
    )
    this.registerEvent(
      this.app.vault.on('modify', () => {
        this.refreshViews()
      })
    )
    this.registerEvent(
      this.app.vault.on('rename', () => {
        this.refreshViews()
      })
    )
    this.registerEvent(
      this.app.vault.on('delete', () => {
        this.refreshViews()
      })
    )
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_PROPERTIES)
    cleanupWorkspace()
  }

  async loadLayout() {
    if (this.settings?.enableMinimalWorskpace) {
      configureMinimalWorkspace()
    } else {
      cleanupWorkspace()
    }
    this.activatePostsView()
    this.activatePropertiesView()
  }

  async refreshViews() {
    const propertyLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_PROPERTIES)
    for (const leaf of propertyLeaves) {
      const view = leaf.view as PropertiesView
      await view.updateProperties()
    }

    const postsLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_POSTS)
    for (const leaf of postsLeaves) {
      const view = leaf.view as PostsView
      await view.fetchAndMountBlogList()
    }
  }

  async activatePostsView() {
    const { workspace } = this.app

    let leaf: WorkspaceLeaf | null = null
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_POSTS)

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0]
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getLeftLeaf(false)
      await leaf?.setViewState({ type: VIEW_TYPE_POSTS, active: true })
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    if (leaf) {
      workspace.revealLeaf(leaf)
    }
  }

  async activatePropertiesView() {
    const { workspace } = this.app

    let leaf: WorkspaceLeaf | null = null
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_PROPERTIES)

    if (leaves.length > 0) {
      leaf = leaves[0]
    } else {
      leaf = workspace.getRightLeaf(false)
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_PROPERTIES, active: true })
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf)
    }
  }
}
