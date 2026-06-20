<script>
    let { post, onClick } = $props();

    const getReadingTime = (wordCount) => {
        const minutes = Math.ceil(wordCount / 200);
        return minutes === 1 ? "1 min read" : `${minutes} min read`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };
</script>

<button type="button" class="post" onclick={onClick}>
    <span class="title">{post.title}</span>
    <span class="excerpt">{post.excerpt}</span>
    <span class="meta">
        {formatDate(post.date)} · {getReadingTime(post.wordCount)}
    </span>
</button>

<style>
    .post {
        all: unset;
        padding: 12px 16px;
        margin-bottom: 4px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.15s ease;
        display: flex;
        flex-direction: column;
    }

    .post:hover {
        background: var(--background-modifier-hover);
    }

    .post .title {
        font-size: 1.05em;
        font-weight: 500;
        color: var(--text-normal);
        margin-bottom: 6px;
        line-height: 1.4;
    }

    .post .excerpt {
        font-size: 0.9em;
        color: var(--text-muted);
        margin-bottom: 6px;
        line-height: 1.5;
    }

    .post .meta {
        font-size: 0.85em;
        color: var(--text-faint);
    }
</style>
