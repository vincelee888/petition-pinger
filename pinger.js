

var Rx = window.Rx;
var _ = window._;
var map = window.map;

var getData = function() {
  return Rx.Observable.ajax({ 
    url: 'https://petition.parliament.uk/petitions/171928.json', 
    crossDomain: true 
  });
}



var last = null;
var findChanges = function(data) {
  var output = [];

  if (last) {
    data.forEach(function(d) {
      var newConstituency = {
        name: d.name,
        signature_count: d.signature_count
      };
      var lastFor = _.find(last, {name: d.name});
      if (!lastFor) {
        output.push(newConstituency);
      } else {
        if (lastFor.signature_count !== newConstituency.signature_count) {
          newConstituency.old_signature_count = lastFor.signature_count;
          output.push(newConstituency);
        }
      }
    })
  }

  last = data;
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

var source = document.getElementById('leaderboard-template').innerHTML; 
var template = Handlebars.compile(source); 
var votes = document.getElementById('votes');

var updateLeaderboard = function() {
  var leaders = _.chain(last)
                .orderBy('signature_count', 'desc')
                .map(function(x) {
                  return {name: x.name, signature_count: x.signature_count};
                })
                .take(20)
                .value();
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
