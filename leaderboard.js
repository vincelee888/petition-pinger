var _ = window._

window.Handlebars.registerHelper('newEntry', function () {
  return new window.Handlebars.SafeString(this.lastPosition === -1 ? 'class="new-entry"' : '')
})

window.Handlebars.registerHelper('movement', function () {
  var change = this.position - this.lastPosition

  var r = 'class="steady"'
  if (change > 0) {
    console.log(this, 'moving up')
    r = 'class="moving-up"'
  }

  if (change < 0) {
    console.log(this, 'moving down')
    r = 'class="moving-down"'
  }

  return new window.Handlebars.SafeString(r)
})

var leaderboardSource = document.getElementById('leaderboard-template').innerHTML
var leaderboardTemplate = window.Handlebars.compile(leaderboardSource)
var votes = document.getElementById('votes')

var lastLeaders = null

function update (data) {
  console.log(data, 'ld')
  var leaders = _.chain(data)
    .orderBy('signature_count', 'desc')
    .map(function (x, index) {
      return {
        name: x.name,
        signature_count: x.signature_count,
        position: index
      }
    })
    .map(function (x) {
      if (!lastLeaders) return x

      var lastTime = _.findIndex(lastLeaders, { name: x.name })
      x.lastPosition = lastTime

      return x
    })
    .take(20)
    .value()

  lastLeaders = leaders
  votes.innerHTML = leaderboardTemplate({leaders: leaders})

  window.hoverActions.init()
}

window.petitionPinger.signatures$.subscribe(update)
