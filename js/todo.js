(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $(function() {
    var AppView, Todo, TodoCollection, TodoView, laterTodos, nowTodos;
    Todo = (function() {
      __extends(Todo, Backbone.Model);
      function Todo() {
        Todo.__super__.constructor.apply(this, arguments);
      }
      Todo.prototype.defaults = {
        completed: false
      };
      Todo.prototype.toggle = function() {
        return this.save({
          completed: !this.get('completed')
        });
      };
      return Todo;
    })();
    TodoCollection = (function() {
      __extends(TodoCollection, Backbone.Collection);
      function TodoCollection() {
        TodoCollection.__super__.constructor.apply(this, arguments);
      }
      TodoCollection.prototype.initialize = function(attributes, options) {
        return this.localStorage = new Store(options.storageName);
      };
      TodoCollection.prototype.model = Todo;
      return TodoCollection;
    })();
    nowTodos = new TodoCollection([], {
      storageName: 'now-todos'
    });
    laterTodos = new TodoCollection([], {
      storageName: 'later-todos'
    });
    TodoView = (function() {
      __extends(TodoView, Backbone.View);
      function TodoView() {
        TodoView.__super__.constructor.apply(this, arguments);
      }
      TodoView.prototype.initialize = function() {
        return this.model.bind('change', this.render, this);
      };
      TodoView.prototype.tagName = 'li';
      TodoView.prototype.className = 'todo-item';
      TodoView.prototype.template = _.template($('#todo-template').html());
      TodoView.prototype.events = {
        "click .check": "toggleCompleted",
        "click .remove": "remove",
        "dblclick": "edit",
        "keypress .todo-editor": "updateOnEnter"
      };
      TodoView.prototype.render = function() {
        var text;
        text = this.model.get('text');
        console.log('rendering', text);
        $(this.el).html(this.template(this.model.toJSON())).find('.todo-content').text(text).end().find('input.check').prop('checked', this.model.get('completed'));
        this.input = this.$('.todo-editor');
        this.input.bind('blur', _.bind(this.close, this)).val(text);
        return this;
      };
      TodoView.prototype.close = function() {
        this.model.save({
          text: $(this.el).find('.todo-editor').val()
        });
        return $(this.el).removeClass('editing');
      };
      TodoView.prototype.edit = function() {
        return $(this.el).addClass('editing').find('.form input').focus();
      };
      TodoView.prototype.remove = function() {
        this.model.destroy();
        return $(this.el).fadeOut('fast', __bind(function() {
          return $(this).remove();
        }, this));
      };
      TodoView.prototype.toggleCompleted = function() {
        return this.model.toggle();
      };
      TodoView.prototype.updateOnEnter = function(event) {
        if (event.keyCode === 13) {
          return this.close();
        }
      };
      return TodoView;
    })();
    AppView = (function() {
      __extends(AppView, Backbone.View);
      function AppView() {
        AppView.__super__.constructor.apply(this, arguments);
      }
      AppView.prototype.initialize = function() {
        nowTodos.bind('add', this.addItem, this);
        nowTodos.bind('reset', this.addAll, this);
        nowTodos.fetch();
        laterTodos.bind('add', this.addLaterTodo, this);
        laterTodos.bind('reset', this.addAllLaterTodos, this);
        return laterTodos.fetch();
      };
      AppView.prototype.el = $('#container');
      AppView.prototype.events = {
        'keypress #todo-input': 'createOnEnter'
      };
      AppView.prototype.addAll = function() {
        return nowTodos.each(this.addItem);
      };
      AppView.prototype.addItem = function(todo) {
        var view;
        view = new TodoView({
          model: todo
        });
        return $('#now-todos ul.todo-list').append(view.render().el);
      };
      AppView.prototype.addAllLaterTodos = function() {
        return laterTodos.each(this.addLaterTodo);
      };
      AppView.prototype.addLaterTodo = function(todo) {
        var view;
        view = new TodoView({
          model: todo
        });
        return $('#later-todos ul.todo-list').append(view.render().el);
      };
      AppView.prototype.createOnEnter = function(event) {
        var text;
        text = $('#todo-input').val();
        if (!text || event.keyCode !== 13) {
          return;
        }
        nowTodos.create({
          text: text
        });
        return $('#todo-input').val('');
      };
      return AppView;
    })();
    return window.App = new AppView;
  });
}).call(this);
