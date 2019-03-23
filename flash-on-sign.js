var lastConstituencies = {}

var findChanges = function (data) {
  var output = data
    .map(function (d) {
      return {
        name: d.name,
        safeName: window.constituencies.makeNameSafe(d.name),
        signature_count: d.signature_count
      }
    })
    .reduce(function (acc, newConstituency) {
      var match = lastConstituencies[newConstituency.safeName]
      match = match || newConstituency

      if (match.signature_count !== newConstituency.signature_count) {
        newConstituency.old_signature_count = match.signature_count
        acc.push(newConstituency)
        console.log(newConstituency, 'yay new cons')
      }
      lastConstituencies[newConstituency.safeName] = newConstituency
      return acc
    }, [])

  return output
}

var flashClearers = {}

var flashConstituency = function (constituencies) {
  constituencies.map(function (c) {
    console.log(c, 'th c')
    var name = c.name
    var safeName = window.constituencies.makeNameSafe(name)
    var el = document.querySelector('[data-constituency="' + safeName + '"]')
    return {
      name,
      safeName,
      el
    }
  }).forEach(function (x) {
    console.log(x.el, `flashing ${x.safeName}`)
    if (x.el) {
      x.el.style.fill = 'yellow'
      flashClearers[x.safeName] && clearTimeout(flashClearers[x.safeName])
      flashClearers[x.safeName] = setTimeout(function () {
        x.el.style.fill = 'white'
      }, 2500)
    }
  })
}

var showNewSignatues = function (changes) {
  if (changes.length > 0) {
    console.log(changes, 'goint to count')
  }
}

var changes$ = window.petitionPinger.signatures$
  .map(findChanges)

changes$.subscribe(flashConstituency)
changes$.subscribe(showNewSignatues)
