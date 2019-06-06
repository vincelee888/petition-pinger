window.constituencies = window.constituencies || {}

window.constituencies.makeNameSafe = function (name) {
  return (name || 'undefined').toLowerCase().replace(/[,\s+\n]/g, '')
}

window.constituencies.find = function (name) {
  var constituencyName = window.constituencies.makeNameSafe(name)
  return document.querySelector('[data-constituency="' + constituencyName + '"]')
}
