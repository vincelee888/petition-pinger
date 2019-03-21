
var Rx = window.Rx

var showItIsBroken = function (err) {
  console.log(err)
  document.getElementById('flash').innerHTML = 'Oh dang, this is broken. Try refreshing'
}

function getData () {
  return window.Rx.Observable.ajax({
    url: window.petitionPinger.url,
    crossDomain: true
  }).catch(function (err) {
    console.log(err, 'ajax error')
    return window.Rx.Observable.of({data: {}})
  })
}

window.petitionPinger = window.petitionPinger || {}

window.petitionPinger.responses$ = Rx.Observable
  .timer(500, 1500)
  .flatMap(getData)
  .map(function (d) { return d.response })
  .publish()
  .refCount()

window.petitionPinger.signatures$ = window.petitionPinger.responses$
  .map(function (d) { return (d && d.data) || {} })
  .map(function (d) { return d.attributes || {} })
  .map(function (d) { return d.signatures_by_constituency || [] })
  .catch(showItIsBroken)
