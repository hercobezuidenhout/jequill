import { ItemView, Notice, TFile, WorkspaceLeaf } from "obsidian"
import BlogList from '../components/BlogList.svelte'
import { mount, unmount } from "svelte"
import { createPostService } from "../services/post"
import type { BlogPost } from "../types"

export const VIEW_TYPE_NEW_BLOG = "jequill-new-blog-view"

export class NewBlogListView extends ItemView {
    blogList: ReturnType<typeof BlogList> | undefined
    posts: BlogPost[] = [];
    private postService: ReturnType<typeof createPostService>

    constructor(leaf: WorkspaceLeaf) {
        super(leaf)
        this.postService = createPostService(this.app)
    }

    getViewType(): string {
        return VIEW_TYPE_NEW_BLOG
    }
    getDisplayText(): string {
        return 'Jequill'
    }

    async refresh() {
        await this.loadPosts()
    }

    async loadPosts() {
        this.posts = await this.postService.loadPosts()
    }

    protected async onOpen(): Promise<void> {
        this.posts = await this.postService.loadPosts()
        this.blogList = mount(BlogList, {
            target: this.contentEl,
            props: {
                posts: this.posts,
                onPostClick: (file) => this.openPostInEditor(file),
                onNewPostClick: () => this.createNewPost()
            }
        })
    }

    protected async onClose(): Promise<void> {
        if (this.blogList) {
            unmount(this.blogList)
        }
    }

    async openPostInEditor(file: TFile) {
        try {
            const leaf = this.app.workspace.getLeaf(false)
            await leaf.openFile(file)
        } catch (error) {
            console.error('Failed to open file:', error)
            new Notice('Failed to open file')
        }
    }

    async createNewPost() {
        try {
            const title = "New post"
            if (!title) return

            const file = await this.postService.createPost(title)
            const leaf = this.app.workspace.getLeaf(false)
            await leaf.openFile(file)
            await this.refresh()
            new Notice(`Created draft: ${title}`)
        } catch (error) {
            console.error('Create post error:', error)
            new Notice(`Failed to create post: ${(error as any).message}`)
        }
    }

}