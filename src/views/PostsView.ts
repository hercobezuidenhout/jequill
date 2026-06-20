import { ItemView, Notice, TFile, WorkspaceLeaf } from "obsidian"
import { mount, unmount } from "svelte"
import { createPostService } from "../services/post"
import type { BlogPost } from "../types"
import Posts from "../components/Posts.svelte"

export const VIEW_TYPE_POSTS = "jequill-posts-view"

export class PostsView extends ItemView {
    blogList: ReturnType<typeof Posts> | undefined
    posts: BlogPost[] = [];
    private postService: ReturnType<typeof createPostService>

    constructor(leaf: WorkspaceLeaf) {
        super(leaf)
        this.postService = createPostService(this.app)
    }

    getViewType(): string {
        return VIEW_TYPE_POSTS
    }
    getDisplayText(): string {
        return 'Jequill'
    }

    protected async onOpen(): Promise<void> {
        await this.fetchAndMountBlogList()
    }

    protected async onClose(): Promise<void> {
        if (this.blogList) {
            unmount(this.blogList)
        }
    }

    async fetchAndMountBlogList() {
        this.posts = await this.postService.loadPosts()
        this.mountBlogList(this.posts)
    }

    mountBlogList(posts: BlogPost[]) {
        if (this.blogList) {
            unmount(this.blogList)
        }

        this.blogList = mount(Posts, {
            target: this.contentEl,
            props: {
                posts: posts,
                onPostClick: (file) => this.openPostInEditor(file),
                onNewPostClick: () => this.createNewPost()
            }
        })
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
            const currentTime = `${new Date().getHours()}${new Date().getMinutes()}${new Date().getMilliseconds()}`
            const title = `New Post ${currentTime}`
            if (!title) return

            const file = await this.postService.createPost(title)
            const leaf = this.app.workspace.getLeaf(false)
            await leaf.openFile(file)

            new Notice(`Created draft: ${title}`)
        } catch (error) {
            console.error('Create post error:', error)
            new Notice(`Failed to create post: ${(error as any).message}`)
        }
    }

}