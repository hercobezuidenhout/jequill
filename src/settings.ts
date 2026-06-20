import type JequillPlugin from './main'
import { App, PluginSettingTab, Setting, type SettingDefinitionItem } from 'obsidian'

export class JequillSettingTab extends PluginSettingTab {
    plugin: JequillPlugin

    constructor(app: App, plugin: JequillPlugin) {
        super(app, plugin)
        this.plugin = plugin
    }

    getSettingDefinitions(): SettingDefinitionItem<string>[] {
        return [
            {
                name: 'Enable minimal workspace',
                control: {
                    type: 'toggle',
                    key: 'enableMinimalWorkspace'
                }
            }
        ]
    }

    display(): void {
        let { containerEl } = this

        containerEl.empty()

        new Setting(containerEl)
            .setName('Enable minimal workspace')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enableMinimalWorskpace)
                    .onChange(async (value) => {
                        this.plugin.settings.enableMinimalWorskpace = value
                        await this.plugin.saveSettings()
                        this.plugin.onSettingsChanged()
                    })
            )
    }
}