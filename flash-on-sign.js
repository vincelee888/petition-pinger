var lastConstituencies = []
var _ = window._

var findChanges = function (data) {
  if (!lastConstituencies) { return [] }

  var output = data
    .map(function (d) {
      return {
        name: d.name,
        signature_count: d.signature_count
      }
    })
    .reduce(function (acc, newConstituency) {
      var lastConstituenciesFor = _.find(
        lastConstituencies,
        { name: newConstituency.name })

      if (lastConstituenciesFor &&
        lastConstituenciesFor.signature_count !== newConstituency.signature_count) {
        newConstituency.old_signature_count = lastConstituenciesFor.signature_count
        acc.push(newConstituency)
      }
      return acc
    }, [])

  lastConstituencies = data
  return output
}

var flashClearers = {}

var flashConstituency = function (constituency) {
  var name = constituency.name
  var el = document.querySelector('[data-constituency="' + window.constituencies.makeNameSafe(name) + '"]')

  if (el) {
    el.style.fill = 'yellow'
    flashClearers[name] && clearTimeout(flashClearers[name])
    flashClearers[name] = setTimeout(function () {
      el.style.fill = 'white'
    }, 2500)
  }
}

var changes$ = window.petitionPinger.signatures$.flatMap(findChanges)

changes$.subscribe(flashConstituency)
