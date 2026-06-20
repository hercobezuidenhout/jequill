<script>
    let { heading, count } = $props();
</script>

<div>
    <h4>{heading}</h4>
    <span>{count}</span>
</div>

<style>
    div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    h4 {
        font-size: 0.85em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
    }

    span {
        font-size: 0.85em;
        color: var(--text-muted);
    }
</style>
