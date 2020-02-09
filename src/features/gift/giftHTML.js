import marked from "marked";
import crypto from "crypto";

export default function giftPreviewHTML(questions) {
  if (!questions) return ``;

  let result = ``;
  for (let question of questions) {
    if (question.type === "Category")
      result += `<div class="category">${sortQuestionType(question)}</div>`;
    else {
      result += `<section class="moodle">${sortQuestionType(
        question
      )}</section>`;
    }
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
        ${formatAnswers(q.choices, q.type)}
        ${formatFeedback(q.globalFeedback)}
        `;
    case "Numerical":
      return `
        ${makeTitle("Numerical", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(q.choices, q.type)}
        ${formatFeedback(q.globalFeedback)}
      `;
    case "Short":
      return `
        ${makeTitle("Short answer", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(q.choices, q.type)}
        ${formatFeedback(q.globalFeedback)} 
        `;
    case "Essay":
      return `${makeTitle("Essay", q.title)}
        <p>${formatText(q.stem)}</p>
        <textarea></textarea>
        ${formatFeedback(q.globalFeedback)}
        `;
    case "TF":
      return `
        ${makeTitle("True/False", q.title)}
        <p>${formatText(q.stem)}</p>
        ${formatAnswers(
          {
            isTrue: q.isTrue,
            correctFeedback: q.correctFeedback,
            incorrectFeedback: q.incorrectFeedback
          },
          q.type
        )}
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

function formatAnswers(choices, type) {
  let result = ``;
  
  const hash = crypto.randomBytes(10).toString('hex');
  
  if (type === "MC") {
    let numberOfCorrect = 0;

    choices.forEach(choice => (choice.isCorrect ? numberOfCorrect++ : null));
    let type = numberOfCorrect === 0 ? "checkbox" : "radio";


    result += `Select one${type === "checkbox" ? " or more:" : ":"}`;

    for (let choice of choices) {
      result += `
      <div class="custom-input">
        <label class="${choice.isCorrect ? "correct" : "wrong"}">
          <input type="${type}" name="${hash}">
          ${conditionalDisplay(choice.weight, `<em>(${choice.weight}%)</em>`)}
          ${formatText(choice.text)} 
          ${choice.feedback !== null ? ` [${formatText(choice.feedback)}]` : ``}
          </input>
        </label>
      </div>
    `;
    }
  }

  if (type === "Short") {
    let choiceText = choices.map(choice => formatText(choice.text));
    result += `
      <div>
        Answer: <input type="text" placeholder="${choiceText.join(", ")}">
      </div>
    `;

    // for (let choice of choices) {
    //   result += `
    //   <p>
    //   ${conditionalDisplay(choice.weight, `<em>(${choice.weight}%)</em>`)}
    //   ${formatText(choice.text)}
    //   ${choice.feedback !== null ? ` [${formatText(choice.feedback)}]` : ``}
    //   </p>
    //   `;
    // }
  }

  if (type === "TF") {
    const isTrue = choices && choices.isTrue;
    const correctFeedback = choices && choices.correctFeedback;
    const incorrectFeedback = choices && choices.incorrectFeedback;

    const feedback = choice =>
      choice !== null ? ` [${formatText(choice)}]` : ``;

    result += `Select one:`;
    result += `
      <div class="custom-input">
        <label class="${choices.isCorrect ? "correct" : "wrong"}">
          <input type="radio" name="${hash}"> 
            True ${isTrue ? feedback(correctFeedback) : feedback(incorrectFeedback)}
          </input>
        </label>
      </div>

      <div class="custom-input">
      <label class="${choices.isCorrect ? "correct" : "wrong"}">
        <input type="radio" name="${hash}">
          False ${!isTrue ? feedback(correctFeedback) : feedback(incorrectFeedback)}
        </input>
      </label>
    </div>
    `;
  }

  if (type === "Numerical") {
    function numericalAnswer(choice) {
      switch (choice.type) {
        case "simple":
          return `${choice.number}`;
        case "range":
          return `${choice.number} ± ${choice.range}`;
        case "high-low":
          return `${choice.numberLow} - ${choice.numberHigh}`;
        default:
          return;
      }
    }

    if (Array.isArray(choices)) {
      let choiceText = choices.map(choice => numericalAnswer(choice.text));

      result = `
        <div>
          Answer: <input type="text" placeholder="${choiceText.join(", ")}">
        <div>
        `;
    } else {
      result = `
      <div>
        Answer: <input type="text", placeholder="${numericalAnswer(choices)}">
      </div>
      `;
    }
  }

  return `${result}`;
}

function formatMatching(matchPairs) {
  let result = ``;

  let subAnswers = `
     <select class="custom-select">
      <option value="" disabled selected hidden>Choose...</option>
      ${matchPairs
        .map(
          match => `
        <option value=${match.subanswer}>
          ${match.subanswer}
        </option>`
        )
        .join("")}
    </select>
    `;

    for (let match of matchPairs) {
      result += `
      <tr>
        <td style="padding-right: 1rem">
        ${formatText(match.subquestion)} 
        </td>
        <td>
        ${subAnswers}
        </div>
        </td>
      </tr>
      `;
    }
    return `<table><tbody>${result}</tbody></table>`;
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
