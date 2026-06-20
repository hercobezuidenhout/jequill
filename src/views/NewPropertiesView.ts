import { ItemView } from "obsidian"
import Properties from "../components/Properties.svelte"
import { mount, unmount } from "svelte"

export const VIEW_TYPE_NEW_PROPERTIES = 'jequill-new-properties-view'

export class NewPropertiesView extends ItemView {
    properties: ReturnType<typeof Properties> | undefined

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
        this.properties = mount(Properties, {
            target: this.contentEl
        })
    }

    protected async onClose(): Promise<void> {
        if (this.properties) {
            unmount(this.properties)
        }
    }

}