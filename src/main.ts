import { Plugin, WorkspaceLeaf } from 'obsidian'
import { configureMinimalWorkspace, cleanupWorkspace } from './ui/workspace'
import { JequillSettingTab } from './settings'
import { PostsView, VIEW_TYPE_POSTS } from './views/PostsView'
import { PostDetailsView, VIEW_TYPE_POST_DETAILS } from './views/PostDetailsView'

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
      VIEW_TYPE_POST_DETAILS,
      (leaf) => new PostDetailsView(leaf)
    )

    this.addRibbonIcon('newspaper', 'Jequill', () => {
      this.activatePostsView()
      this.activatePropertiesView()
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
    cleanupWorkspace()
  }

  async loadLayout() {
    if (this && this.settings) {
      if (this.settings?.enableMinimalWorskpace) {
        configureMinimalWorkspace()
      } else {
        cleanupWorkspace()
      }
      this.activatePostsView()
      this.activatePropertiesView()
    }
  }

  async refreshViews() {
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
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_POST_DETAILS)

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0]
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getRightLeaf(false)
      await leaf?.setViewState({ type: VIEW_TYPE_POST_DETAILS, active: true })
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    if (leaf) {
      workspace.revealLeaf(leaf)
    }
  }
}
