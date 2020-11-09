export default function createSnippetPreview(): string {
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
  <h1 id="gift-format">GIFT Format</h1>
  <p><strong>Docs:</strong> <a href="https://ethan-ou.github.io/vscode-gift-docs/docs/introduction/">VSCode GIFT Docs</a>, <a href="https://docs.moodle.org/39/en/GIFT_format">Moodle Docs</a></p>
  <h2 id="snippets">Snippets</h2>
  <p>Type either a Plain-English or Shorthand snippet into your editor and press <kbd>Enter</kbd>.</p>
  <table>
    <thead>
      <tr>
        <th align="right">Plain-English</th>
        <th>Shorthand</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td align="right"><code>multiple choice question</code></td>
        <td><code>mcq</code>, <code>mc2</code>, <code>mc3</code>, <code>mc4</code>, <code>mc5</code>, <code>mc6</code></td>
      </tr>
      <tr>
        <td align="right"><code>multiple choice question multiple</code></td>
        <td><code>mcqm</code>, <code>mc2m</code>, <code>mc3m</code>, <code>mc4m</code>, <code>mc5m</code>, <code>mc6m</code></td>
      </tr>
      <tr>
        <td align="right"><code>matching question</code></td>
        <td><code>maq</code>, <code>ma2</code>, <code>ma3</code>, <code>ma4</code>, <code>ma5</code>, <code>ma6</code></td>
      </tr>
      <tr>
        <td align="right"><code>short answer question</code></td>
        <td><code>saq</code>, <code>sa1</code>, <code>sa2</code>, <code>sa3</code>, <code>sa4</code>, <code>sa5</code>, <code>sa6</code></td>
      </tr>
      <tr>
        <td align="right"><code>missing word question</code></td>
        <td><code>mwq</code>, <code>mw1</code>, <code>mw2</code>, <code>mw3</code>, <code>mw4</code>, <code>mw5</code>, <code>mw6</code></td>
      </tr>
      <tr>
        <td align="right"><code>true false question</code></td>
        <td><code>tfq</code></td>
      </tr>
      <tr>
        <td align="right"><code>essay question</code></td>
        <td><code>ess</code></td>
      </tr>
      <tr>
        <td align="right"><code>numerical question</code></td>
        <td><code>nq</code></td>
      </tr>
      <tr>
        <td align="right"><code>title</code></td>
        <td></td>
      </tr>
      <tr>
        <td align="right"><code>category</code></td>
        <td><code>cat</code></td>
      </tr>
      <tr>
        <td align="right"><code>category nested</code></td>
        <td><code>catn</code></td>
      </tr>
      <tr>
        <td align="right"><code>description</code></td>
        <td><code>des</code></td>
      </tr>
    </tbody>
  </table>
  <br>
  <h2 id="title-variants">Title Variants</h2>
  <p>Use these snippets for questions with titles:</p>
  <table>
    <thead>
      <tr>
        <th align="right">Plain-English</th>
        <th>Shorthand</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td align="right"><code>multiple choice question title</code></td>
        <td><code>mcqt</code>, <code>mc2t</code>, <code>mc3t</code>, <code>mc4t</code>, <code>mc5t</code>, <code>mc6t</code></td>
      </tr>
      <tr>
        <td align="right"><code>multiple choice question multiple title</code></td>
        <td><code>mcqmt</code>, <code>mc2mt</code>, <code>mc3mt</code>, <code>mc4mt</code>, <code>mc5mt</code>, <code>mc6mt</code></td>
      </tr>
      <tr>
        <td align="right"><code>matching question title</code></td>
        <td><code>maqt</code>, <code>ma2t</code>, <code>ma3t</code>, <code>ma4t</code>, <code>ma5t</code>, <code>ma6</code></td>
      </tr>
      <tr>
        <td align="right"><code>short answer question title</code></td>
        <td><code>saqt</code>, <code>sa1t</code>, <code>sa2t</code>, <code>sa3t</code>, <code>sa4t</code>, <code>sa5t</code>, <code>sa6</code></td>
      </tr>
      <tr>
        <td align="right"><code>missing word question title</code></td>
        <td><code>mwqt</code>, <code>mw1t</code>, <code>mw2t</code>, <code>mw3t</code>, <code>mw4t</code>, <code>mw5t</code>, <code>ma6</code></td>
      </tr>
      <tr>
        <td align="right"><code>true false question title</code></td>
        <td><code>tfqt</code></td>
      </tr>
      <tr>
        <td align="right"><code>essay question title</code></td>
        <td><code>esst</code></td>
      </tr>
      <tr>
        <td align="right"><code>numerical question title</code></td>
        <td><code>nqt</code></td>
      </tr>
    </tbody>
  </table>
</div>
`;
