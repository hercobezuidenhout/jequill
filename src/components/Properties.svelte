<script>
    let { title, date, isDraft, onDelete, onSave, onPublish, onUnpublish } =
        $props();

    let statefulTitle = $state(title);
    let statefulDate = $state(date);
    let loading = $state(false);

    const handleClick = async (callback, ...args) => {
        loading = true;

        await callback(...args);
    };
</script>

<div class="properties-view">
    {#if isDraft}
        <div class="callout" data-callout="info">
            <div class="callout-title">
                <div class="callout-title-inner">DRAFT</div>
            </div>
            <div class="callout-content">
                This post hasn't been published yet
            </div>
        </div>
    {:else}
        <div class="callout" data-callout="success">
            <div class="callout-title">
                <div class="callout-title-inner">PUBLISHED</div>
            </div>
            <div class="callout-content">This post is live</div>
        </div>
    {/if}
    <h4>Properties</h4>
    <div class="form-control">
        <label for="title">Title</label>
        <input name="title" bind:value={statefulTitle} />
    </div>
    <div class="form-control">
        <label for="date">Date</label>
        <input name="date" type="date" bind:value={statefulDate} />
    </div>

    <hr />
    <div class="button-group">
        <div>
            <button onclick={() => handleClick(onDelete)} class="danger"
                >Delete</button
            >
        </div>
        <div>
            <button
                onclick={() => handleClick(onSave, statefulTitle, statefulDate)}
                >Save</button
            >
            {#if isDraft}
                <button onclick={() => handleClick(onPublish)} class="mod-cta"
                    >Publish</button
                >
            {:else}
                <button onclick={() => handleClick(onUnpublish)} class="mod-cta"
                    >Unpublish</button
                >
            {/if}
        </div>
    </div>
</div>

<style>
    .properties-view {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    h4 {
        font-size: 0.85em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        margin: 0;
    }

    .form-control {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }

    input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        background: var(--background-primary);
        color: var(--text-normal);
        font-size: 0.95em;
        transition: border-color 0.15s ease;
    }

    input:focus {
        outline: none;
        border-color: var(--interactive-accent);
    }

    input::placeholder {
        color: var(--text-faint);
    }

    hr {
        margin: 0.5rem;
    }

    .button-group {
        display: flex;
        justify-content: space-between;
    }

    button {
        cursor: pointer;
    }

    button.danger {
        color: var(--text-error);
    }
</style>
