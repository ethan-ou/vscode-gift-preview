import marked from "marked";

export default function giftPreviewHTML(questions) {
  if (!questions) return ``;

  let result = ``;
  for (let question of questions) {
    result += `<div>${sortQuestionType(question)}</div>`;
  }
  return result;
}

function sortQuestionType(q) {
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
        ${formatAnswers(q.choices)}
        ${formatFeedback(q.globalFeedback)}
        `;
    case "Short":
      return `
        ${makeTitle("Short answer", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(q.choices)}
        ${formatFeedback(q.globalFeedback)} 
        `;
    case "Essay":
      return `${makeTitle("Essay", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatFeedback(q.globalFeedback)}
        `;
    case "TF":
      return `
        ${makeTitle("True/False", q.title)}
        <p><em>("${q.isTrue ? "True" : "False"}")</em>
        ${formatText(q.stem)}</p>
        ${formatFeedback(q.globalFeedback)}
        `;
    case "Matching":
      return `
        ${makeTitle("Matching", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatMatching(q.matchPairs)}
        ${formatFeedback(q.globalFeedback)}
        `;
    default:
      return;
  }
}

function makeTitle(type, title) {
  return `<b>${type} ${conditionalDisplay(title, `" ${title} "`)}</b>`;
}

function formatAnswers(choices) {
  let result = ``;
  for (let choice of choices) {
    result += `
    <li class="${choice.isCorrect ? "correct" : "wrong"}">
    ${conditionalDisplay(choice.weight, `<em>(${choice.weight}%)</em>`)} 
    ${formatText(choice.text)}
    ${choice.feedback !== null ? ` [${formatText(choice.feedback)}]` : ``}
    </li>
    `;
  }
  return `<ul>${result}</ul>`;
}

function formatMatching(matchPairs) {
  let result = ``;
  for (let match of matchPairs) {
    result += `
    <li>
      ${formatText(match.subquestion)} => ${match.subanswer}
    </li>
    `;
  }
  return `<ul>${result}<ul>`;
}

function formatText(giftText) {
  switch (giftText.format) {
    case "moodle":
    case "plain":
    case "html":
      return giftText.text;
    case "markdown":
      return marked(giftText.text);
    default:
      return;
  }
}

function formatFeedback(feedback) {
  return feedback !== null
    ? `<p style="margin-left: 40px"><em>General feedback:</em>${formatText(
        feedback
      )}</p>`
    : ``;
}

function conditionalDisplay(variable, output) {
  return variable !== null ? output : ``;
}
