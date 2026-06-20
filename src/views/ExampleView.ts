import { ItemView, WorkspaceLeaf } from 'obsidian'
import Counter from '../Counter.svelte'
import { mount, unmount } from 'svelte'

export const VIEW_TYPE_EXAMPLE = 'example-view'

export class ExampleView extends ItemView {
    // A variable to hold on to the Counter instance mounted in this ItemView.
    counter: ReturnType<typeof Counter> | undefined
    timer: NodeJS.Timer | undefined

    constructor(leaf: WorkspaceLeaf) {
        super(leaf)
    }

    getViewType() {
        return VIEW_TYPE_EXAMPLE
    }

    getDisplayText() {
        return 'Example view'
    }

    async onOpen() {
        this.counter = mount(Counter, {
            target: this.contentEl,
            props: {
                startCount: 5
            }
        })

        this.timer = setInterval(() => {
            this.counter.increment()
        }, 1000)


    }

    async onClose() {
        if (this.counter) {
            // Remove the Counter from the ItemView.
            unmount(this.counter)
        }

        if (this.timer) {
            clearInterval(this.timer)
        }
    }
}