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
                <td align="right"><code>mcq</code>
                    <br><code>mc2</code>
                    <br><code>mc3</code>
                    <br><code>mc4</code>
                    <br><code>mc5</code>
                    <br><code>mc6</code></td>
                <td><code>multiple choice question</code></td>
            </tr>
            <tr>
                <td align="right"><code>mcqm</code>
                    <br><code>mc2m</code>
                    <br><code>mc3m</code>
                    <br><code>mc4m</code>
                    <br><code>mc5m</code>
                    <br><code>mc6m</code></td>
                <td><code>multiple choice question multiple</code></td>
            </tr>
            <tr>
                <td align="right"><code>maq</code>
                    <br><code>ma2</code>
                    <br><code>ma3</code>
                    <br><code>ma4</code>
                    <br><code>ma5</code>
                    <br><code>ma6</code></td>
                <td><code>matching question</code></td>
            </tr>
            <tr>
                <td align="right"><code>saq</code>
                    <br><code>sa1</code>
                    <br><code>sa2</code>
                    <br><code>sa3</code>
                    <br><code>sa4</code>
                    <br><code>sa5</code>
                    <br><code>sa6</code></td>
                <td><code>short answer question</code></td>
            </tr>
            <tr>
                <td align="right"><code>mwq</code>
                    <br><code>mw1</code>
                    <br><code>mw2</code>
                    <br><code>ma3</code>
                    <br><code>ma4</code>
                    <br><code>ma5</code>
                    <br><code>ma6</code></td>
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
                <td align="right"><code>cat</code>
                    <br><code>$CAT</code></td>
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