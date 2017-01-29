
var Rx = window.Rx;

var overs$ = null;

window.constituencies = window.constituencies || {};
window.constituencies.makeNameSafe = function(name) {
  return name.toLowerCase().replace(',', '');
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

    var overs$ = Rx.Observable.fromEvent(sources, 'mousemove');
    overs$.subscribe(function(e) {
      var constituency = findConstituency(e.srcElement.innerText);
      if (constituency) { 
        constituency.classList.add('highlight'); 
      }
    });

    var outs$ = Rx.Observable.fromEvent(sources, 'mouseout');
    outs$.subscribe(function(e) {
      var constituency = findConstituency(e.srcElement.innerText);
      if (constituency) { 
        constituency.classList.remove('highlight'); 
      }
    });
  }
};