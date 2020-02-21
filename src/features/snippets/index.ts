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
    <p>Type one of the following snippets and press <code>ENTER</code>:</p>
    <table>
        <thead>
            <tr>
                <th align="right">Snippet</th>
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
            <tr>
                <td align="right"><code>description</code></td>
                <td><code>Description.</code></td>
            </tr>
        </tbody>
    </table>
    <p><strong>For Titles:</strong> add <code>title</code> at the end of the snippet (e.g. <code>multiple choice question title</code>).</p>
    <br>
    <h2 id="advanced-snippets">Advanced Snippets</h2>
    <p><strong>Note:</strong> Numbers represent number of options (e.g. <code>mc2</code> is a multiple choice with two options).</p>
    <table>
        <thead>
            <tr>
                <th align="right">Snippet</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td align="right"><code>mcq</code>, <code>mc[2-6]</code></td>
                <td><code>multiple choice question</code></td>
            </tr>
            <tr>
                <td align="right"><code>mcqm</code>, <code>mc[2-6]m</code></td>
                <td><code>multiple choice question multiple</code></td>
            </tr>
            <tr>
                <td align="right"><code>maq</code>, <code>ma[2-6]</code></td>
                <td><code>matching question</code></td>
            </tr>
            <tr>
                <td align="right"><code>saq</code>, <code>sa[1-6]</code></td>
                <td><code>short answer question</code></td>
            </tr>
            <tr>
                <td align="right"><code>mwq</code>, <code>mw[1-6]</code></td>
                <td><code>missing word question</code></td>
            </tr>
            <tr>
                <td align="right"><code>tfq</code></td>
                <td><code>true false question</code></td>
            </tr>
            <tr>
                <td align="right"><code>ess</code></td>
                <td><code>essay question</code></td>
            </tr>
            <tr>
                <td align="right"><code>nq</code></td>
                <td><code>numerical question</code></td>
            </tr>
            <tr>
                <td align="right"><code>cat</code>, <code>$CAT</code></td>
                <td><code>category</code></td>
            </tr>
            <tr>
                <td align="right"><code>catn</code></td>
                <td><code>category nested</code></td>
            </tr>
            <tr>
                <td align="right"><code>des</code></td>
                <td><code>description</code></td>
            </tr>
        </tbody>
    </table>
    <p><strong>For Titles:</strong> Add a <code>t</code> at the end of the snippet (e.g. <code>mcqt</code>).</p>
</div>
`;