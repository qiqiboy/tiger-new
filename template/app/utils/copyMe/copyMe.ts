function createNode(text) {
    const node = document.createElement('div');

    node.innerText = text;
    node.style.cssText = 'position:absolute; top: 0; left: 0; height:0; width:0; pointer-events: none;';

    document.body.appendChild(node);

    return node;
}

export default function copyMe(text) {
    const targetNode = createNode(text);
    const range = document.createRange();
    const selection = window.getSelection()!;

    targetNode.focus();
    range.selectNodeContents(targetNode);
    selection.removeAllRanges();

    selection.addRange(range);

    let result;

    try {
        result = document.execCommand('copy');
    } catch (e) {
        result = false;
    }

    document.body.removeChild(targetNode);

    return result;
}
