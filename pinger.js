

var Rx = window.Rx;
var _ = window._;
var map = window.map;

var getData = function() {
  return Rx.Observable.ajax({ 
    url: 'https://petition.parliament.uk/petitions/171928.json', 
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
  var el = document.querySelector('[data-constituency="'+ name + '"]')
  if (el) {
    el.style.fill = 'yellow';
    setTimeout(function() {
      el.style.fill = 'white';
    },2500);
  }
};

Handlebars.registerHelper("newEntry", function() {
    return this.newEntry ? 'class="new-entry"' : '';
});

Handlebars.registerHelper("movingUp", function() {
    return this.movingUp ? 'class="moving-up"' : '';
});

var source = document.getElementById('leaderboard-template').innerHTML; 
var template = Handlebars.compile(source); 
var votes = document.getElementById('votes');

var lastLeaders = null;
var updateLeaderboard = function() {
  var leaders = _.chain(lastConstituencies)
                .orderBy('signature_count', 'desc')
                .map(function(x) {
                  return {name: x.name, signature_count: x.signature_count};
                })
                .map(function(x) {
                  if (!lastLeaders) return x;

                  var lastTime = _.find(lastLeaders, {name: x.name});
                  if (!lastTime) {
                    x.newEntry = true;
                  } else {
                    if (lastTime.signature_count < x.signature_count) {
                      x.movingUp = true;
                    }  
                  }
                  
                  return x;
                })
                .take(20)
                .value();
  lastLeaders = leaders;
  votes.innerHTML = template({leaders: leaders});
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
