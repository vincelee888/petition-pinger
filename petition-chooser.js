window.Rx.Observable.ajax({
  url: 'https://petition.parliament.uk/petitions.json?state=open',
  crossDomain: true
})
  .flatMap(function (r) { return r.response.data })
  .take(50)
  .subscribe(function (d) {
    var list = document.getElementById('popular-petitions')
    var optionNode = document.createElement('option')
    optionNode.value = d.links.self
    optionNode.appendChild(document.createTextNode(`${d.attributes.action} : ${d.attributes.signature_count} signatures`))
    list.appendChild(optionNode)
  })

var petitionInput = document.getElementById('petition')
window.Rx.Observable.fromEvent(petitionInput, 'keyup')
  .startWith(petitionInput.value)
  .debounceTime(500)
  .subscribe(function (t) {
    window.petitionPinger.url = petitionInput.value
  })
