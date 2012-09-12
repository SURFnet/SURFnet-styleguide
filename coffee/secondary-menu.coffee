menuElm = null
currentActive = null
animating = false


init = ->
  menuElm = $ '.secondary-menu'

  return unless menuElm.length

  bindEvents()
  foldInactive()



bindEvents = ->
  menuElm.on 'click', 'a', toggleMenu



foldInactive = ->
  toFold = menuElm.find '> ul > li:not(.active)'
  toFold.find('ul').slideUp 0
  currentActive = menuElm.find '.active'
  return



toggleMenu = (e) ->
  tgt = $ e.target

  ulElms = tgt.parentsUntil('.secondary-menu', 'ul')

  # User clicked the top level menu item
  return unless ulElms.length is 1

  toFold = tgt.siblings('ul')

  return unless toFold.length

  e.preventDefault()

  return if animating
  animating = true

  if toFold.closest('li').hasClass 'active'
    toFold.slideToggle 500, ->
      animating = false
  else
    toFold.slideDown 500
    currentActive.find('ul').slideUp 500, ->
      currentActive.removeClass 'active'
      currentActive = toFold.closest 'li'
      currentActive.addClass 'active'
      animating = false



$ init