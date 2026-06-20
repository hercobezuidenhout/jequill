import { ItemView, Notice, TFile, WorkspaceLeaf } from "obsidian"
import Properties from "../components/Properties.svelte"
import { mount, unmount } from "svelte"
import { parseFrontmatter, updateMultipleProperties } from "../services/frontmatter"
import { createPostService } from "../services/post"
import { createGitService } from "../services/git"

export const VIEW_TYPE_NEW_PROPERTIES = 'jequill-new-properties-view'

export class NewPropertiesView extends ItemView {
    properties: ReturnType<typeof Properties> | undefined
    currentFile: TFile | null = null;
    private postService: ReturnType<typeof createPostService>
    private gitService: ReturnType<typeof createGitService>

    constructor(leaf: WorkspaceLeaf) {
        super(leaf)
        this.postService = createPostService(this.app)
        this.gitService = createGitService((this.app.vault.adapter as any).basePath)
    }

    getViewType(): string {
        return VIEW_TYPE_NEW_PROPERTIES
    }
    getDisplayText(): string {
        return "New properties view"
    }
    getIcon() {
        return 'settings'
    }

    protected async onOpen(): Promise<void> {
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', () => {
                this.renderView()
            })
        )

        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                if (file === this.currentFile) {
                    this.renderView()
                }
            })
        )
    }

    protected async onClose(): Promise<void> {
        if (this.properties) {
            unmount(this.properties)
        }
    }

    async renderView() {
        const activeFile = this.app.workspace.getActiveFile()
        console.log('activeFile', activeFile)
        if (!activeFile || (!activeFile.path.startsWith('_posts/') && !activeFile.path.startsWith('_drafts/'))) {
            return
        }

        this.currentFile = activeFile

        const content = await this.app.vault.read(activeFile)
        const frontmatter = parseFrontmatter(content)

        if (this.properties) {
            unmount(this.properties)
        }

        this.properties = mount(Properties, {
            target: this.contentEl,
            props: {
                title: frontmatter.title,
                date: frontmatter.date?.split(' ')[0],
                isDraft: activeFile.path.startsWith('_drafts/'),
                onDelete: () => this.deletePost(),
                onSave: (newTitle, newDate) => this.savePost(newTitle, newDate),
                onPublish: () => this.publishPost(),
                onUnpublish: () => this.unpublishPost()
            }
        })
    }

    async deletePost() {
        if (!this.currentFile) return

        const confirmation = confirm(`Are you sure you want to delete "${this.currentFile.name}"?`)

        if (!confirmation) return

        try {
            const basename = this.currentFile.basename
            await this.postService.deletePost(this.currentFile)
            await this.gitService.commitAndPush(`Delete: ${basename}`)

            new Notice(`Deleted: ${basename}`)
            this.currentFile = null
        } catch (error) {
            console.error('Failed to delete post:', error)
            new Notice('Failed to delete post')
        }
    }

    async savePost(newTitle, newDate) {
        if (!this.currentFile) return

        console.log(newDate)

        try {
            const updates: Record<string, any> = {}
            updates['title'] = newTitle
            updates['date'] = newDate

            const content = await this.app.vault.read(this.currentFile)
            const newContent = updateMultipleProperties(content, updates)
            await this.app.vault.modify(this.currentFile, newContent)
            await this.gitService.commitAndPush(`save: ${this.currentFile.name}`)
            new Notice('Post updated')
        } catch (error) {
            console.error('Failed to save post:', error)
            new Notice('Failed to save post')
        }
    }

    async publishPost() {
        if (!this.currentFile) return

        try {
            const title = this.currentFile.basename
            const renamedFile = await this.postService.publishPost(this.currentFile)
            await this.gitService.commitAndPush(`Publish: ${title}`)

            new Notice(`Published: ${title}`)

            this.currentFile = renamedFile
            const leaf = this.app.workspace.getLeaf(false)
            await leaf.openFile(renamedFile)
        } catch (error) {
            console.error('Failed to publish post:', error)
            new Notice(`Failed to publish post: ${(error as any).message}`)
        }
    }

    async unpublishPost() {
        if (!this.currentFile) return

        try {
            const title = this.currentFile.basename
            const renamedFile = await this.postService.unpublishPost(this.currentFile)
            await this.gitService.commitAndPush(`Unpublish: ${title}`)

            new Notice(`Unpublished: ${title}`)

            this.currentFile = renamedFile
            const leaf = this.app.workspace.getLeaf(false)
            await leaf.openFile(renamedFile)
        } catch (error) {
            console.error('Failed to unpublish post:', error)
            new Notice(`Failed to unpublish post: ${(error as any).message}`)
        }
    }
}