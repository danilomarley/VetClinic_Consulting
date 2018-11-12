$(document).ready(function () {
    //Instance of Collection "Clinics" 
    var clinics = new Clinics();
    //Binding event on Collection changed
    clinics.bind("change add remove", function () {
        datatable.updateDataSource(clinics.toJSON());
    });
    //Data table instance
    var datatable = null;

    //Creating new ClinicsConsultingView
    ClinicConsultingView = Backbone.View.extend({
        //View events
        events: {
            "click #more": "moreInformation",
            "input #searchClinic": "searchClinic",
            "click #tableClinics": "tableSelected"
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
            this.$el.append("<label>Clinic name</label></br>");
            this.$el.append("<input type='text' style='font-family: 'FontAwesome'' placeholder='Search' id='searchClinic' />");
            this.$el.append("<div style='padding-top:5px; padding-bottom:3px' id='tableClinics'></div>");
            this.$el.append("<p style='font-size: 13;''>click to show more informations</p>");
            return this;
        },
        //afterRender to create new objects
        afterRender: function () {
            $('#loading').hide();
            $('#searchClinic').puiinputtext();

            $('#content').puipanel({
                title: "Clinics searcher"
            });

            //Data table Colums
            var dataTableColumns = [
                { field: 'Name', headerText: 'Name' },
                { field: 'Address', headerText: 'Address' },
                { field: 'Phone', headerText: 'Phone' },
                { field: 'City', headerText: 'City' },
            ];
            // New instance of data table
            datatable = new sortpuidatatable('#tableClinics', dataTableColumns);

            //Fetching data from url (url information in model.js)
            $('#loading').show();
            clinics.fetch({
                success: function () {
                    $('#loading').hide();
                },
                error: function (ex) {
                    $('#loading').hide();
                    $.toast.error("Error!", "Error has occured when try to get clinics");
                }
            });
        },
        //Method to filter data when text box changed
        searchClinic: function (e) {
            e.stopPropagation();
            //Geting value of input
            var value = $('#searchClinic').val();
            if (value === "")
                //Clear datatable to initial data
                datatable.updateDataSource(clinics.toJSON());
            else {
                //Getting filtered data
                var filteredData = clinics.byName(value);
                //Updating data table with new filtered data
                datatable.updateDataSource(filteredData.toJSON());
            }

        },
        //Method to pass information to edit view
        tableSelected: function (e) {
            var target = e.target.nodeName;
            if (target != "TD")
                return;
            var data = datatable.getSelection();
            if (data == null)
                return;
            //Dispose index view
            this.remove();
            this.unbind();
            //Add div when back from edit this has link to recreate index view
            $('body').append("<div id='content' ></div>");
            //Generate new Clinic model from data receivede from data table (json)
            var selectedClinic = new Clinic(data);
            //Instance of new Edit View
            var clinicDetailView = new ClinicDetailView({ el: '#content', model: selectedClinic });
            clinicDetailView.render();
        }
    });
    //instance of new ConsultingView (index)    
    var clinicConsultingView = new ClinicConsultingView({ el: '#content' });
    clinicConsultingView.render();
});
