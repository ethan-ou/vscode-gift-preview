import morphdom from "morphdom";

export function updateHTML(html: string) {
    const content: Element | null = document.querySelector('.vscode-body');
    if (content) {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        let docBody = doc.querySelector('.vscode-body');

        if (docBody) {
            let addClasses = findExcludedClasses(content.classList, docBody.classList);
            
            if (addClasses.length > 0) {
                docBody.classList.add(...addClasses);
            }

            morphdom(content, docBody, {
                onBeforeElUpdated: function(fromEl, toEl) {
                    if (fromEl.isEqualNode(toEl)) {
                        return false;
                    }
                    return true;
                }
            });
        }
    }
}

function findExcludedClasses(oldList: DOMTokenList, newList: DOMTokenList): string[] {
    let arrayOld = [...oldList];
    let arrayNew = [...newList];
    return arrayOld.filter(x => arrayNew.indexOf(x) === -1);
}   
