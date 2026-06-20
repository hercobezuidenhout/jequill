import { Plugin, WorkspaceLeaf } from 'obsidian'
import { configureMinimalWorkspace, cleanupWorkspace, registerMinimalWorkspaceStyles } from './ui/workspace'
import { JequillSettingTab } from './settings'
import { PostsView, VIEW_TYPE_POSTS } from './views/PostsView'
import { PostDetailsView, VIEW_TYPE_POST_DETAILS } from './views/PostDetailsView'

interface JequillPluginSettings {
  enableMinimalWorkspace: boolean
}

const DEFAULT_SETTINGS: Partial<JequillPluginSettings> = {
  enableMinimalWorkspace: false,
}

export default class JequillPlugin extends Plugin {
  settings!: JequillPluginSettings

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
    this.app.workspace.trigger('jequill:settings-changed')
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

    this.registerEvent(
      this.app.workspace.on('jequill:settings-changed' as any, () => {
        this.renderLayout()
      })
    )

    this.addCommand({
      id: 'toggle-minimal-workspace',
      name: 'Toggle Minimal Workspace',
      checkCallback: (checking: boolean) => {
        if (checking) return !!this.settings

        this.settings.enableMinimalWorkspace = !this.settings.enableMinimalWorkspace
        this.saveSettings()

        return true
      },
      hotkeys: [
        {
          modifiers: ['Mod', 'Shift'],
          key: 'M',
        },
      ],
    })

    registerMinimalWorkspaceStyles()

    this.renderLayout()
  }

  onunload() {
    cleanupWorkspace()
  }

  renderLayout() {
    if (this.settings?.enableMinimalWorkspace) {
      configureMinimalWorkspace()
    } else {
      cleanupWorkspace()
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
