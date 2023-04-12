const attributes = [
  "inspector-line",
  "inspector-column",
  "inspector-filename",
  "inspector-component-name",
];
export function deleteAttribute(dom = document.body) {
  const { children } = dom;
  attributes.forEach((attr) => {
    dom.removeAttribute(attr);
  });

  if (children) {
    for (let i = 0, l = children.length; i < l; i++) {
      deleteAttribute(children[i] as HTMLElement);
    }
  }
}
