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
  setTimeout(() => {
    M.FormSelect.init(document.querySelectorAll(`select`))
  }, 500);
}

export function datePicker(id) {
  let options = {
    format: 'mm-dd-yyyy',
    showClearBtn: true
  }
  M.Datepicker.init(document.getElementById(`date${id}`), options);
}

export function setDate(id, val) {  
  setTimeout(() => {
    const elem = M.Datepicker.getInstance(document.getElementById(`date${id}`))
    if (elem){
      elem.setDate(val);
    }
  }, 500);
}

export function tooltip(id) {
  M.Tooltip.init(document.getElementById(`tip${id}`))
}