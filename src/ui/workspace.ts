const STYLE_ID = 'jekyll-minimal-workspace'

export const registerMinimalWorkspaceStyles = (): void => {
  if (document.getElementById(STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ID

  style.textContent = `
    .jekyll-minimal-workspace .side-dock-ribbon.mod-left {
      display: none !important;
    }

    .jekyll-minimal-workspace .status-bar {
      display: none !important;
    }

    .jekyll-minimal-workspace .view-header .view-actions {
      visibility: hidden !important;
    }

    .jekyll-minimal-workspace .clickable-icon {
      visibility: hidden !important;
    }

    .jekyll-minimal-workspace .workspace-tab-header-container-inner {
      display: none !important;
    }

    .jekyll-minimal-workspace .metadata-container {
      display: none !important;
    }

    .jekyll-minimal-workspace .frontmatter-container {
      display: none !important;
    }
  `

  document.head.appendChild(style)
}

export const configureMinimalWorkspace = (): void => {
  document.body.classList.add('jekyll-minimal-workspace')
}

export const cleanupWorkspace = (): void => {
  document.body.classList.remove('jekyll-minimal-workspace')
}