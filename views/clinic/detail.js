//Create new ClinicEditView
ClinicDetailView = Backbone.View.extend({
  //View events
  events: {
    "click #back": "backToIndex"
  },
  //trigged when new instance of this view is called
  initialize: function (options) {
    //Configuration of "afterRender" event to execute after render event finished          
    _.bindAll(this, 'render', 'afterRender');
    var _this = this;
    this.render = _.wrap(this.render, function (render) {
      render();
      _this.afterRender();
      return _this;
    });
  },
  //Render to generate view     
  render: function () {
    var template = _.template($('#detailTemplate').html());
    this.$el.append(template(this.model.toJSON()));
    this.$el.append("<button id='back'>Back</button>");
    return this;
  },
  //afterRender to create new objects
  afterRender: function () {
    $('#back').puibutton({
      icon: 'fa-arrow-left'
    });
    $('#content').puipanel({
      title: "Clinic informations"
    });;
  },
  //Event of button to return to index
  backToIndex: function () {
    //Dispose edit view
    this.remove();
    this.unbind();
    //Add div when back from index this has link to recreate edit view
    $('body').append("<div id='content' ></div>");
    //Instance of new index View
    var clinicConsultingView = new ClinicConsultingView({ el: '#content' });
    clinicConsultingView.render();
  }


});