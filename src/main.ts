import { Plugin, WorkspaceLeaf } from 'obsidian'
import { PropertiesView } from './views/PropertiesView'
import { configureMinimalWorkspace, cleanupWorkspace } from './ui/workspace'
import { VIEW_TYPE_BLOG, VIEW_TYPE_PROPERTIES } from './types'
import { ExampleView, VIEW_TYPE_EXAMPLE } from './views/ExampleView'
import { JequillSettingTab } from './settings'
import { NewBlogListView, VIEW_TYPE_NEW_BLOG } from './views/NewBlogListView'

interface JequillPluginSettings {
  enableMinimalWorskpace: boolean
}

const DEFAULT_SETTINGS: Partial<JequillPluginSettings> = {
  enableMinimalWorskpace: false,
}

export default class JequillPlugin extends Plugin {
  settings: JequillPluginSettings | undefined

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  async onSettingsChanged() {
    this.loadLayout()
  }



  async onload() {
    await this.loadSettings()

    this.addSettingTab(new JequillSettingTab(this.app, this))

    this.registerView(
      VIEW_TYPE_NEW_BLOG,
      (leaf) => new NewBlogListView(leaf)
    )

    this.registerView(
      VIEW_TYPE_PROPERTIES,
      (leaf) => new PropertiesView(leaf, this)
    )

    this.addRibbonIcon('newspaper', 'Jekyll Blog Manager', () => {
      this.activateView()
    })

    this.addRibbonIcon('newspaper', 'Jequill', () => {
      this.activateBlogListView()
    })

    this.addCommand({
      id: 'open-jekyll-blog-view',
      name: 'Open Blog Manager',
      callback: () => {
        this.activateView()
      }
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

  async loadLayout() {
    if (this.settings?.enableMinimalWorskpace) {
      configureMinimalWorkspace()
    } else {
      cleanupWorkspace()
    }
    this.activateView()
    this.activatePropertiesView()
  }

  async refreshViews() {
    const propertyLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_PROPERTIES)
    for (const leaf of propertyLeaves) {
      const view = leaf.view as PropertiesView
      await view.updateProperties()
    }

    const postsLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NEW_BLOG)
    for (const leaf of postsLeaves) {
      const view = leaf.view as NewBlogListView
      await view.fetchAndMountBlogList()
    }
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_PROPERTIES)
    cleanupWorkspace()
  }

  async activateBlogListView() {
    const { workspace } = this.app

    let leaf: WorkspaceLeaf | null = null
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_NEW_BLOG)

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0]
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getLeftLeaf(false)
      await leaf?.setViewState({ type: VIEW_TYPE_NEW_BLOG, active: true })
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    if (leaf) {
      workspace.revealLeaf(leaf)
    }
  }

  async activateView() {
    const { workspace } = this.app

    let leaf: WorkspaceLeaf | null = null
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_BLOG)

    if (leaves.length > 0) {
      leaf = leaves[0]
    } else {
      leaf = workspace.getLeftLeaf(false)
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_BLOG, active: true })
      }
    }

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
