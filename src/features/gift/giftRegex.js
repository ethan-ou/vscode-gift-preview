export default function(text) {
    let document = text.split(/\r?\n/)
        .map(comment => comment.replace(/(^[ \\t]+)?(([\W\n]|^)(\/\/)+).+/g, ''))
        .map(category => category.replace(/(^[ \\t]+)?(((^|\n)\s*[$]CATEGORY:))(.+)/g, `<b>$5</b>`))
        .map(title => title.replace(/\s*(::)\s*(.*?)(::)/g, `<b>$2</b><br>`));
    console.log(document);
    return document.map(i => `<p>${i}<p>`).join('');
}