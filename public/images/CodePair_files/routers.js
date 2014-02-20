// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  jQuery(function() {
    var ApplicationRouter, app, _ref;
    app = IS('ip');
    ApplicationRouter = (function(_super) {
      __extends(ApplicationRouter, _super);

      function ApplicationRouter() {
        _ref = ApplicationRouter.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ApplicationRouter.prototype.routes = {
        "": "question",
        "question/:number": "question"
      };

      ApplicationRouter.prototype.question = function(number) {
        var index, indexes, new_question, paper,
          _this = this;
        if (number == null) {
          number = 1;
        }
        paper = '';
        new_question = true;
        if (number > 0) {
          index = parseInt(number, 10) - 1;
        }
        indexes = app.papers.pluck('index');
        app.qnum = number;
        if ($.inArray(index, indexes) > -1) {
          new_question = false;
        }
        if (new_question) {
          paper = new app.PaperModel({
            user: app.Current.get('user'),
            docname: app.Current.get('docname'),
            title: app.Current.get('title'),
            def: {
              language: 'cpp',
              theme: 'tomorrow_night',
              users: [],
              compiling: false,
              input: '',
              console: '',
              saved_codes: {},
              index: index,
              status: 1
            }
          });
          app.papers.add(paper);
          app.questions.set('total', app.questions.get('total') + 1);
        } else {
          paper = _.find(app.papers.models, function(model) {
            return model.get('index') === index;
          });
          if (!paper) {
            paper = new app.PaperModel;
            ({
              user: app.Current.get('user'),
              docname: app.Current.get('docname'),
              title: app.Current.get('title'),
              def: {
                language: 'cpp',
                theme: 'tomorrow_night',
                users: [],
                compiling: false,
                input: '',
                console: '',
                saved_codes: {},
                index: index,
                status: 1
              }
            });
          }
        }
        app.paper = paper;
        this.app_view = new app.ApplicationView({
          collection: app.papers,
          model: app.paper,
          el: '#wrapper'
        });
        return this;
      };

      ApplicationRouter.prototype.initialize = function() {
        var papers;
        app.papers = papers = new app.PapersCollection;
        app.questions = new app.QuestionsCountModel({
          docname: app.Current.get('docname') + '-questions'
        });
        if (app.Current.get('user').role === 'admin') {
          app.feedback = new app.SharedModel({
            type: 'text',
            docname: app.Current.get('docname') + '-feedback',
            def: ''
          });
        }
        return app.scratch_pad = new app.SharedModel({
          type: 'text',
          docname: app.Current.get('docname') + '-scratchpad',
          def: ''
        });
      };

      return ApplicationRouter;

    })(Backbone.Router);
    app.ApplicationRouter = ApplicationRouter;
    return this;
  });

}).call(this);