$ ->
  class Todo extends Backbone.Model
    
    defaults: 
      completed: false
    
    toggle: ->
      @save {completed: !@get 'completed'}
  
  
  
  class TodoCollection extends Backbone.Collection
    
    initialize: (attributes, options) ->
      @localStorage = new Store(options.storageName)
    
    model: Todo
  
  
  
  nowTodos = new TodoCollection([], {storageName: 'now-todos'})
  
  laterTodos = new TodoCollection([], {storageName: 'later-todos'})
  
  
  class TodoView extends Backbone.View
    
    initialize: ->
      @model.bind 'change', @render, this
    
    tagName: 'li'
    
    className: 'todo-item'
    
    template: _.template($('#todo-template').html())
    
    events:
      "click .check": "toggleCompleted"
      "click .remove": "remove"
      "dblclick": "edit"
      "keypress .todo-editor": "updateOnEnter"
    
    render: ->
      text = @model.get 'text'
      
      console.log('rendering', text);
      
      $(@el)
        .html(@template(@model.toJSON()))
        .find('.todo-content')
        .text(text)
        .end()
        .find('input.check')
        .prop('checked', @model.get('completed'))
      
      this.input = this.$('.todo-editor')
      this.input
        .bind('blur', _.bind(this.close, this))
        .val(text)
      
      this
    
    close: ->
      @model.save {text: $(@el).find('.todo-editor').val()}
      $(@el).removeClass('editing')
    
    edit: ->
      $(@el)
        .addClass('editing')
        .find('.form input')
        .focus()
    
    remove: -> 
      @model.destroy()
      $(@el).fadeOut 'fast', () =>
        $(this).remove()
    
    toggleCompleted: ->
      @model.toggle()
    
    updateOnEnter: (event) ->
      @close() if event.keyCode == 13
  
  
  
  class AppView extends Backbone.View
    
    initialize: ->
      nowTodos.bind 'add', @addItem, this
      nowTodos.bind 'reset', @addAll, this
      nowTodos.fetch()
      
      laterTodos.bind 'add', @addLaterTodo, this
      laterTodos.bind 'reset', @addAllLaterTodos, this
      laterTodos.fetch()
      
      $("#now-todo-list, #later-todo-list").sortable({
        connectWith: ".todo-list"
      }).disableSelection();
    
    el: $('#container')
    
    events:
      'keypress #todo-input': 'createOnEnter'
    
    addAll: ->
      nowTodos.each(@addItem)
    
    addItem: (todo) ->
      view = new TodoView {model: todo}
      $('#now-todos ul.todo-list').append(view.render().el)
    
    addAllLaterTodos: ->
      laterTodos.each(@addLaterTodo)
    
    addLaterTodo: (todo) ->
      view = new TodoView {model: todo}
      $('#later-todos ul.todo-list').append(view.render().el)
    
    createOnEnter: (event) ->
      text = $('#todo-input').val()
      
      return if !text or event.keyCode isnt 13
      
      nowTodos.create {text: text}
      
      $('#todo-input').val('')
  
  
  
  window.App = new AppView
