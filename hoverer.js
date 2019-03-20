
var Rx = window.Rx;

var overs$ = null;

window.constituencies = window.constituencies || {};
window.constituencies.makeNameSafe = function(name) {
  return name.toLowerCase().replace(/[,\s+\n]/g, '');
};

var findConstituency = function(name) {
  var constituencyName = constituencies.makeNameSafe(name);
  return document.querySelector('[data-constituency="'+ constituencyName +'"]');
};

window.hoverActions = window.hoverActions || {
  init: function() {
    if (overs$)
      overs$.dispose();

    var sources = document.querySelectorAll('#votes .constituency-name');

    var overs$ = Rx.Observable
      .fromEvent(sources, 'mousemove')
      .debounceTime(150);

    overs$.subscribe(function(e) {
      var constituency = findConstituency(e.srcElement.innerText);
      if (constituency) {
        constituency.classList.add('highlight');
      }
    });
    overs$.subscribe(function(e) {
      e.srcElement.parentElement.classList.add('highlight');
    });

    var outs$ = Rx.Observable.fromEvent(sources, 'mouseout');
    outs$.subscribe(function(e) {
      var constituency = findConstituency(e.srcElement.innerText);
      if (constituency) {
        constituency.classList.remove('highlight');
      }
    });
    outs$.subscribe(function(e) {
      e.srcElement.parentElement.classList.remove('highlight');
    });
  }
};
