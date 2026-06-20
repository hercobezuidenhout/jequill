import { ItemView, WorkspaceLeaf } from "obsidian"
import BlogList from '../components/BlogList.svelte'
import { mount, unmount } from "svelte"

export const VIEW_TYPE_NEW_BLOG = "jequill-new-blog-view"

export class NewBlogListView extends ItemView {
    blogList: ReturnType<typeof BlogList> | undefined

    constructor(leaf: WorkspaceLeaf) {
        super(leaf)
    }

    getViewType(): string {
        return VIEW_TYPE_NEW_BLOG
    }
    getDisplayText(): string {
        return 'Jequill'
    }

    protected async onOpen(): Promise<void> {
        this.blogList = mount(BlogList, {
            target: this.contentEl
        })
    }

    protected async onClose(): Promise<void> {
        if (this.blogList) {
            unmount(this.blogList)
        }
    }

}