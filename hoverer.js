var Rx = window.Rx

window.hoverActions = window.hoverActions || {
  init: function () {
    var sources = document.querySelectorAll('#votes .constituency-name')

    Rx.Observable
      .fromEvent(sources, 'mousemove')
      .debounceTime(50)
      .subscribe(function (e) {
        var constituency = window.constituencies.find(e.srcElement.innerText)
        constituency && constituency.classList.add('highlight')
        e.srcElement.parentElement.classList.add('highlight')
      })

    Rx.Observable
      .fromEvent(sources, 'mouseout')
      .subscribe(function (e) {
        var constituency = window.constituencies.find(e.srcElement.innerText)
        constituency && constituency.classList.remove('highlight')
        e.srcElement.parentElement.classList.remove('highlight')
      })
  }
}
