export default function createSnippetPreview() {
    return `<div class="markdown-body" style="
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 2rem;
    ">${snippets}</div>`;
}

const snippets = `
<div>
    <h1>GIFT Language</h1>
    <p>To get started, type one of the following snippets and press <code>ENTER</code>:</p>
    <table>
        <thead>
            <tr>
                <th align="right">Prefix</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td align="right"><code>multiple choice question</code></td>
                <td><code>Multiple choice question with four options.</code></td>
            </tr>
            <tr>
                <td align="right"><code>multiple choice question multiple</code></td>
                <td><code>Multiple choice question with multiple answers.</code></td>
            </tr>
            <tr>
                <td align="right"><code>matching question</code></td>
                <td><code>Matching question with four options.</code></td>
            </tr>
            <tr>
                <td align="right"><code>short answer question</code></td>
                <td><code>Short answer question with one correct answer.</code></td>
            </tr>
            <tr>
                <td align="right"><code>missing word question</code></td>
                <td><code>Missing word question with three options.</code></td>
            </tr>
            <tr>
                <td align="right"><code>true false question</code></td>
                <td><code>True-false question.</code></td>
            </tr>
            <tr>
                <td align="right"><code>essay question</code></td>
                <td><code>Essay question.</code></td>
            </tr>
            <tr>
                <td align="right"><code>numerical question</code></td>
                <td><code>Numerical question.</code></td>
            </tr>
            <tr>
                <td align="right"><code>title</code></td>
                <td><code>Question title.</code></td>
            </tr>
            <tr>
                <td align="right"><code>category</code></td>
                <td><code>Category label.</code></td>
            </tr>
            <tr>
                <td align="right"><code>category nested</code></td>
                <td><code>Nested category label.</code></td>
            </tr>
        </tbody>
    </table>
</div>
`;