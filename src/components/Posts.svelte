<script lang="js">
    import Post from "./Post.svelte";
    import PostsSectionHeader from "./PostsSectionHeader.svelte";

    let { posts, onPostClick, onNewPostClick } = $props();
    let drafts = posts.filter((post) => post.isDraft);
    let published = posts.filter((post) => !post.isDraft);
</script>

<div class="jequill-header">
    <h2>Writing</h2>
    <button onclick={onNewPostClick} class="mod-cta">New post</button>
</div>

{#if drafts.length}
    <div>
        <PostsSectionHeader heading="Drafts" count={drafts.length} />
        <div class="post-list">
            {#each drafts as post}
                <Post {post} onClick={() => onPostClick(post.file)} />
            {/each}
        </div>
    </div>
{/if}

{#if published.length}
    <div>
        <PostsSectionHeader heading="Published" count={published.length} />
        <div class="post-list">
            {#each published as post}
                <Post {post} onClick={() => onPostClick(post.file)} />
            {/each}
        </div>
    </div>
{/if}

<style>
    .jequill-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .jequill-header h2 {
        margin: 0;
        color: var(--text-normal);
    }

    button {
        cursor: pointer;
    }

    .post-list {
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }
</style>
