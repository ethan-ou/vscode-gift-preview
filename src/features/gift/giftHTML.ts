import marked from "marked";
import { nanoid } from "nanoid";
import katex from "katex";

interface Text {
  format: TextFormat;
  text: string;
}

enum TextFormat {
  moodle = "moodle",
  plain = "plain",
  html = "html",
  markdown = "markdown",
}

export default function giftPreviewHTML(questions: any[]): string {
  if (!questions) {
    return ``;
  }

  let result = ``;
  for (const question of questions) {
    if (question.type === "Category") {
      result += `<section class="category">${sortQuestionType(
        question
      )}</section>`;
    } else {
      result += `<section class="moodle">${sortQuestionType(
        question
      )}</section>`;
    }
  }
  return result;
}

function sortQuestionType(q: any): string {
  switch (q.type) {
    case "Category":
      return `
        ${makeTitle("Category", q.title)}
        `;
    case "Description":
      return `
        ${makeTitle("Description", q.title)}
        <p>${formatText(q.stem)}</p>
        `;
    case "MC":
      return `
        ${makeTitle("Multiple choice", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(q.choices, q.type)}
        ${formatGeneralFeedback(q.globalFeedback)}
        `;
    case "Numerical":
      return `
        ${makeTitle("Numerical", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(q.choices, q.type)}
        ${formatGeneralFeedback(q.globalFeedback)}
      `;
    case "Short":
      return `
        ${makeTitle("Short answer", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(q.choices, q.type)}
        ${formatGeneralFeedback(q.globalFeedback)} 
        `;
    case "Essay":
      return `${makeTitle("Essay", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(q.choices, q.type)}
        ${formatGeneralFeedback(q.globalFeedback)}
        `;
    case "TF":
      return `
        ${makeTitle("True/False", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(
          {
            isTrue: q.isTrue,
            correctFeedback: q.correctFeedback,
            incorrectFeedback: q.incorrectFeedback,
          },
          q.type
        )}
        ${formatGeneralFeedback(q.globalFeedback)}
        `;
    case "Matching":
      return `
        ${makeTitle("Matching", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(q.matchPairs, "Matching")}
        ${formatGeneralFeedback(q.globalFeedback)}
        `;
    default:
      return ``;
  }
}

function makeTitle(type: string, title: string): string {
  return `
    <div class="title">
      <span>
        ${
          title
            ? title
            : `<span class="moodle-blue-darker">Optional Title...</span>`
        }
      </span>
      <span class="question-type">
        <span class="raised">${type}</span>
      </span>
    </div>
  `;
}

function formatAnswers(choices: any, type: string): string {
  let result = ``;

  const hash = `id${nanoid(6)}`;

  if (type === "MC") {
    const multipleAnswer = checkMultipleAnswer(choices);

    result += `Select one${multipleAnswer ? " or more" : ""}:`;

    for (const choice of choices) {
      const positiveWeight = choice.weight > 0 ? true : false;
      const correctOption = multipleAnswer ? positiveWeight : choice.isCorrect;
      const displayWeight = choice.weight
        ? `<span class="weight ${correctOption ? `weight-correct` : ``}">${
            choice.weight
          }%</span>`
        : ``;

      result += `
      <div class="custom-input">
        <label>
          <input type="${multipleAnswer ? "checkbox" : "radio"}" name="${hash}">
          ${displayWeight}
          ${formatText(choice.text)} 
          ${formatAnswerIcon(correctOption)}
          <span class="feedback">${formatFeedback(choice.feedback)}</span>
          </input>
        </label>
      </div>
    `;
    }

    return result;
  }

  if (type === "Short") {
    const choiceText = choices.map((choice: any) => formatText(choice.text));
    return `
      <div>
        Answer: <input type="text" placeholder="${choiceText.join(", ")}">
      </div>
    `;
  }

  if (type === "TF") {
    const choicesTrueFalse = createTrueFalse(choices);

    result += `Select one:`;

    for (const choice of choicesTrueFalse) {
      result += `
      <div class="custom-input">
        <label>
          <input type="radio" name="${hash}"> 
            ${choice.text} ${formatAnswerIcon(choice.isCorrect)} 
            <span class="feedback">${formatFeedback(choice.feedback)}</span>
          </input>
        </label>
      </div>`;
    }

    return result;
  }

  if (type === "Numerical") {
    if (Array.isArray(choices)) {
      const choiceText = choices.map((choice) => numericalAnswer(choice.text));
      return `
        <div>
          Answer: <input type="text" placeholder="${choiceText.join(", ")}">
        <div>
        `;
    } else {
      return `
      <div>
        Answer: <input type="text", placeholder="${numericalAnswer(choices)}">
      </div>
      `;
    }
  }

  if (type === "Matching") {
    //Filters the answers for duplicates before creating drop-down options
    const answers = choices
      .map((item: any) => item.subanswer)
      .filter(
        (item: any, index: number, arr: any[]) => arr.indexOf(item) === index
      )
      .reduce(
        (sum: string, match: any) =>
          (sum += `
      <option>${match}</option>
      `),
        ""
      );

    return `
      <table>
        <tbody>
        ${choices.reduce(
          (sum: string, choice: any) =>
            (sum += `
          <tr>
            <td style="padding-right: 1rem">
              ${formatText(choice.subquestion)} 
            </td>
            <td>
              <select class="custom-select">
                <option value="" disabled selected hidden>Choose...</option>
                ${answers}
              </select>
            </td>
          </tr>
          `),
          ""
        )}
        </tbody>
      </table>`;
  }

  if (type === "Essay") {
    return `<textarea></textarea>`;
  }

  return result;
}

function checkMultipleAnswer(choices: any[]): boolean {
  const numberOfCorrect = choices.reduce(
    (sum, current) => (current.isCorrect ? sum + 1 : sum),
    0
  );

  return numberOfCorrect === 0 ? true : false;
}

function formatFeedback(choice: Text): string {
  return choice ? `${formatText(choice)}` : ``;
}

function createTrueFalse(choices: any) {
  return [
    {
      text: "True",
      isCorrect: choices.isTrue,
      feedback: choices.isTrue
        ? choices.correctFeedback
        : choices.incorrectFeedback,
    },
    {
      text: "False",
      isCorrect: !choices.isTrue,
      feedback: !choices.isTrue
        ? choices.correctFeedback
        : choices.incorrectFeedback,
    },
  ];
}

function numericalAnswer(choice: any): string {
  switch (choice.type) {
    case "simple":
      return `${choice.number}`;
    case "range":
      return `${choice.number} ± ${choice.range}`;
    case "high-low":
      return `${choice.numberLow} - ${choice.numberHigh}`;
    default:
      return ``;
  }
}

function formatText(giftText: Text): string {
  const { text, format } = giftText;

  const formatText = formatLatex(text);

  switch (format) {
    case "moodle":
      return formatText.replace(/(?:\\r\\n|\\r|\\n)/g, "<br>");
    case "plain":
      return formatText;
    case "html":
      return formatText.trim().replace(/(^<p>)(.*?)(<\/p>)$/gm, "$2");
    case "markdown":
      return marked(formatText)
        .trim()
        .replace(/(?:\\r\\n|\\r|\\n)/g, "<br>")
        .replace(/(^<p>)(.*?)(<\/p>)$/gm, "$2");
    default:
      return ``;
  }
}

function formatLatex(text: string) {
  return text
    .replace(/\$\$(.*?)\$\$/g, (outer, inner) =>
      katex.renderToString(inner, { displayMode: true })
    )
    .replace(/\\\[(.*?)\\\]/g, (outer, inner) =>
      katex.renderToString(inner, { displayMode: true })
    )
    .replace(/\\\((.*?)\\\)/g, (outer, inner) =>
      katex.renderToString(inner, { displayMode: false })
    );
}

function formatGeneralFeedback(feedback: Text): string {
  return feedback !== null
    ? `<div class="moodle-alt"><p>${formatText(feedback)}</p></div>`
    : ``;
}

function formatAnswerIcon(correct: boolean): string {
  const faCheck = `<svg class="icon" style="display: inline-block; width: 1em; color: #5cb85c;" role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg>`;
  const faTimes = `<svg class="icon" style="display: inline-block; width: 0.75em; color: #d9534f;" role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>`;
  return correct ? faCheck : faTimes;
}
