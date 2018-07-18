
var Rx = window.Rx;
var _ = window._;
var map = window.map;

var url;

var showItIsBroken = function(err) {
  console.log(err)
  document.getElementById('flash').innerHTML = "Oh dang, this is broken. Try refreshing"
}

var getData = function() {
  return Rx.Observable.ajax({
    url,
    crossDomain: true
  }).catch(function () { return Rx.Observable.of({data: {}})});
}

var lastConstituencies = null;
var findChanges = function(data) {
  var output = [];

  if (lastConstituencies) {
    data.forEach(function(d) {
      var newConstituency = {
        name: d.name,
        signature_count: d.signature_count
      };
      var lastConstituenciesFor = _.find(lastConstituencies, {name: d.name});
      if (!lastConstituenciesFor) {
        output.push(newConstituency);
      } else {
        if (lastConstituenciesFor.signature_count !== newConstituency.signature_count) {
          newConstituency.old_signature_count = lastConstituenciesFor.signature_count;
          output.push(newConstituency);
        }
      }
    })
  }

  lastConstituencies = data;
  return output;
};

var updateConstituency = function(constituency) {
  var name = constituency.name;
  var el = document.querySelector('[data-constituency="'+ window.constituencies.makeNameSafe(name) + '"]')
  if (el) {
    el.style.fill = 'yellow';
    setTimeout(function() {
      el.style.fill = 'white';
    },2500);
  }
};

Handlebars.registerHelper("newEntry", function() {
    return new Handlebars.SafeString(this.lastPosition === -1 ? 'class="new-entry"' : '');
});

Handlebars.registerHelper("movement", function() {
  var change = this.position - this.lastPosition;

  var r = '';

  if (change > 0) {
    r = 'class="moving-up"';
  }

  if (change < 0) {
   r = 'class="moving-down"';
  }

  return new Handlebars.SafeString(r);
});

var nowTrackingSource = document.getElementById('now-tracking-template').innerHTML;
var nowTrackingTemplate = Handlebars.compile(nowTrackingSource);
var nowTrackingOutlet = document.getElementById('now-tracking-outlet');
function updateNowTracking(response) {

  if (response && response.data && response.data.attributes) {
    var p = {
      name: response.data.attributes.action,
      signatureCount: response.data.attributes.signature_count,
      state: response.data.attributes.state,
      url: response.links.self.trim('.json')
    }
    nowTrackingOutlet.innerHTML = nowTrackingTemplate(p)
  } else {
    nowTrackingOutlet.innerHTML=''
  }
}

var leaderboardSource = document.getElementById('leaderboard-template').innerHTML;
var leaderboardTemplate = Handlebars.compile(leaderboardSource);
var votes = document.getElementById('votes');

var lastLeaders = null;
var updateLeaderboard = function() {
  var leaders = _.chain(lastConstituencies)
                .orderBy('signature_count', 'desc')
                .map(function(x, index) {
                  return {
                    name: x.name,
                    signature_count: x.signature_count,
                    position: index
                  };
                })
                .map(function(x) {
                  if (!lastLeaders) return x;

                  var lastTime = _.findIndex(lastLeaders, {name: x.name});
                  x.lastPosition = lastTime;

                  return x;
                })
                .take(20)
                .value();

  lastLeaders = leaders;
  votes.innerHTML = leaderboardTemplate({leaders: leaders});

  window.hoverActions.init();
}

var petitionInput = document.getElementById('petition')
Rx.Observable.fromEvent(petitionInput, 'keyup')
  .startWith(petitionInput.value)
  .debounceTime(500)
  .subscribe(function(t) {
    url = petitionInput.value
  })

var responses$ = Rx.Observable
  .timer(500, 500)
  .flatMap(getData)
  .map(function(d) { return d.response; })

var changes$ = responses$
  .map(function(d) { return (d && d.data) || {}; })
  .map(function(d) { return d.attributes || {}; })
  .map(function(d) { return d.signatures_by_constituency || []; })
  .flatMap(findChanges)
  .catch(showItIsBroken);

changes$.subscribe(updateConstituency, showItIsBroken);
changes$.subscribe(updateLeaderboard, showItIsBroken);
responses$.subscribe(updateNowTracking, showItIsBroken);

Rx.Observable.ajax({
    url: 'https://petition.parliament.uk/petitions.json?state=open',
    crossDomain: true
  })
  .flatMap(function (r) { return r.response.data })
  .take(50)
  .subscribe(function (d) {
    var list = document.getElementById('popular-petitions')
    var optionNode =  document.createElement("option");
    optionNode.value = d.links.self;
    optionNode.appendChild(document.createTextNode(`${d.attributes.action} : ${d.attributes.signature_count} signatures`));
    list.appendChild(optionNode);
  });
