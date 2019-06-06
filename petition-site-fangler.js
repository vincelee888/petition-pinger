
var nowTrackingSource = document.getElementById('now-tracking-template').innerHTML
var nowTrackingTemplate = window.Handlebars.compile(nowTrackingSource)
var nowTrackingOutlet = document.getElementById('now-tracking-outlet')

function updateNowTracking (response) {
  if (response && response.data && response.data.attributes) {
    var p = {
      name: response.data.attributes.action,
      signatureCount: response.data.attributes.signature_count,
      state: response.data.attributes.state,
      url: response.links.self.trim('.json')
    }
    nowTrackingOutlet.innerHTML = nowTrackingTemplate(p)
  } else {
    nowTrackingOutlet.innerHTML = ''
  }
}

window.petitionPinger.responses$.subscribe(updateNowTracking)
