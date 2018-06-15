export function sideNav() {
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
}

export function hideNavOverlay() {
  var instance = M.Sidenav.getInstance(elem);
  instance.close()
}

export function collapse() {
  M.Collapsible.init(document.querySelectorAll('.collapsible'))
}

export function resizeTextArea(id) {
  M.textareaAutoResize(document.getElementById(`notes${id}`))
}

export function select() {
  M.FormSelect.init(document.querySelectorAll(`select`))
}