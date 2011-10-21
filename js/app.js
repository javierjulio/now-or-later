$(function(){
  
  window.Todo = Backbone.Model.extend({
    
    defaults: {
      completed: false
    },
    
    toggle: function() {
      this.save({completed: !this.get('completed')});
    }
    
  });
  
  
  window.TodoCollection = Backbone.Collection.extend({
    
    initialize: function(attributes, options) {
      this.localStorage = new Store(options.storageName);
    },
    
    model: Todo
    
  });
  
  window.NowTodos = new TodoCollection([],{
    storageName: 'now-todos'
  });
  
  window.LaterTodos = new TodoCollection([],{
    storageName: 'later-todos'
  });
  
  
  window.TodoView = Backbone.View.extend({
    
    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    
    tagName: 'li',
    
    className: 'todo-item',
    
    template: _.template($('#todo-template').html()),
    
    events: {
      "click .check": "toggleCompleted",
      "click .remove": "remove",
      "dblclick": "edit",
      "keypress .todo-editor": "updateOnEnter"
    },
    
    render: function() {
      var text = this.model.get('text');
      console.log('rendering', text);
      $(this.el)
        .html(this.template(this.model.toJSON()))
        .find('.todo-content')
        .text(text)
        .end()
        .find('input.check')
        .prop('checked', this.model.get('completed'));
      
       this.input = this.$('.todo-editor');
       this.input
        .bind('blur', _.bind(this.close, this))
        .val(text);
      
      return this;
    },
    
    close: function() {
      this.model.save({text: $(this.el).find('.todo-editor').val()});
      $(this.el).removeClass('editing');
    },
    
    edit: function() {
      $(this.el)
        .addClass('editing')
        .find('.form input')
        .focus();
    },
    
    remove: function() {
      this.model.destroy();
      $(this.el).fadeOut('fast', function(){ $(this).remove() });
      return false;
    },
    
    toggleCompleted: function() {
      this.model.toggle();
    },
    
    updateOnEnter: function(event) {
      if (event.keyCode == 13) 
        this.close();
    }
    
  });
  
  
  window.AppView = Backbone.View.extend({
    
    initialize: function() {
      NowTodos.bind('add', this.add, this);
      NowTodos.bind('reset', this.addAll, this);
      
      NowTodos.fetch();
    },
    
    el: $('#container'),
    
    events: {
      'keypress #todo-input': 'createOnEnter'
    },
    
    addAll: function() {
      NowTodos.each(this.add);
    },
    
    add: function(todo) {
      var view = new TodoView({model: todo})
      $('#now-todos ul.todo-list').append(view.render().el);
    },
    
    createOnEnter: function(e) {
      var text = $('#todo-input').val();
      
      if (!text || e.keyCode != 13) 
        return;
      
      NowTodos.create({text: text});
      
      $('#todo-input').val('')
    }
    
  });
  
  window.App = new AppView
  
});