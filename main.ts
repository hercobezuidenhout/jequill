import { Plugin, WorkspaceLeaf } from 'obsidian'


export default class JekyllBlogManagerPlugin extends Plugin {
  async onload() {

    this.registerView(
      'jekyll-blog-view',
      (leaf) => new JekyllBlogView(leaf, this)
    )

    this.registerView(
      'jekyll-properties-view',
      (leaf) => new JekyllPropertiesView(leaf, this)
    )

    this.addRibbonIcon('newspaper', 'Jekyll Blog Manager', () => {
      this.activateView()
    })

    this.addCommand({
      id: 'open-jekyll-blog-view',
      name: 'Open Blog Manager',
      callback: () => {
        this.activateView()
      }
    })

    this.addSettingTab(new JekyllBlogSettingTab(this.app, this))

    this.app.workspace.onLayoutReady(() => {
      this.configureMinimalWorkspace()
      this.activateView()
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

  }

  async refreshViews() {
    const blogLeaves = this.app.workspace.getLeavesOfType('jekyll-blog-view')
    for (const leaf of blogLeaves) {
      const view = leaf.view as JekyllBlogView
      await view.refresh()
    }
    const propertyLeaves = this.app.workspace.getLeavesOfType('jekyll-properties-view')
    for (const leaf of propertyLeaves) {
      const view = leaf.view as JekyllPropertiesView
      await view.updateProperties()
    }
  }


  configureMinimalWorkspace() {
    const leftRibbon = document.querySelector('.side-dock-ribbon.mod-left')
    if (leftRibbon) {
      (leftRibbon as HTMLElement).style.display = 'none'
    }

    const statusBar = document.querySelector('.status-bar')
    if (statusBar) {
      (statusBar as HTMLElement).style.display = 'none'
    }

    const style = document.createElement('style')
    style.id = 'jekyll-minimal-workspace'
    style.textContent = `
      .view-header .view-actions {
        visibility: hidden !important;
      }
      .clickable-icon {
        visibility: hidden !important;
      }
      .workspace-tab-header-container-inner {
        display: none !important;
      }
      .metadata-container {
        display: none !important;
      }
      .frontmatter-container {
        display: none !important;
      }
    `
    document.head.appendChild(style)
  }

  async activatePropertiesView() {
    const { workspace } = this.app

    let leaf: WorkspaceLeaf | null = null
    const leaves = workspace.getLeavesOfType('jekyll-properties-view')

    if (leaves.length > 0) {
      leaf = leaves[0]
    } else {
      leaf = workspace.getRightLeaf(false)
      if (leaf) {
        await leaf.setViewState({ type: 'jekyll-properties-view', active: true })
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf)
    }
  }

  onunload() {
    this.app.workspace.detachLeavesOfType('jekyll-blog-view')
    this.app.workspace.detachLeavesOfType('jekyll-properties-view')
  }

  async activateView() {
    const { workspace } = this.app

    let leaf: WorkspaceLeaf | null = null
    const leaves = workspace.getLeavesOfType('jekyll-blog-view')

    if (leaves.length > 0) {
      leaf = leaves[0]
    } else {
      leaf = workspace.getLeftLeaf(false)
      if (leaf) {
        await leaf.setViewState({ type: 'jekyll-blog-view', active: true })
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf)
    }
  }
}
