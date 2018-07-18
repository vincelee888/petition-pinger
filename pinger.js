
var Rx = window.Rx;
var _ = window._;
var map = window.map;

var getData = function() {
  return Rx.Observable.ajax({
    url: 'https://cors.io/?u=https://petition.parliament.uk/petitions/223729.json',
    crossDomain: true
  });
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

var source = document.getElementById('leaderboard-template').innerHTML;
var template = Handlebars.compile(source);
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
  votes.innerHTML = template({leaders: leaders});

  window.hoverActions.init();
}

var changes$ = Rx.Observable
  .timer(500, 5000)
  .flatMap(getData)
  .map(function(d) { return d.response; })
  .map(function(d) {
    return d.data.attributes.signatures_by_constituency || [];
  })
  .flatMap(findChanges);

changes$.subscribe(updateConstituency);
changes$.subscribe(updateLeaderboard);
