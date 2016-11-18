$(function () {
    // global variable to configure timeout and refresh interval
    // both variables are in seconds!
    var refreshInterval = 5;
    var refreshTimeout = 3;

    // calculate warning thresholds
    var outDatedWarning = (refreshInterval * 3);
    var outDatedError = (refreshInterval * 10);

    // last updated timestamp global variable
    var lastUpdatedTimestamp = 0;

    // add a endsWith function to strings
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    // Gauge chart configuration options {{{
    var gauge_options = {
        palette: 'Soft Pastel',
        animation: {
            enabled: false
        },
        valueIndicator: {
            type: 'triangleNeedle',
            color: '#7a8288'
        },
        title: {
             text: 'Cluster storage utilization',
             font: { size: 18, color: '#c8c8c8', family: 'Helvetica' },
             position: 'bottom-center'
        },
        geometry: {
            startAngle: 180,
            endAngle: 0
        },
        margin: {
            top: 0,
            right: 10
        },
        rangeContainer: {
            ranges: [
                { startValue: 0, endValue: 60, color: '#62c462' },
                { startValue: 60, endValue: 80, color: '#f89406' },
                { startValue: 80, endValue: 100, color: '#ee5f5b' }
            ]
        },
        scale: {
            startValue: 0,
            endValue: 100,
            majorTick: {
                tickInterval: 20
            },
            label: {
                customizeText: function (arg) {
                    return arg.valueText + ' %';
                }
            }
        }
    };
    // }}}

    // Graphite to flot configuration options {{{
    var flot_options = {
        grid: {
            show: true
        },
        xaxis: {
            mode: "time",
            timezone: "browser"
        },
        legend: {
            show: true
        },
        grid: {
            hoverable: true,
            clickable: true
        },
        tooltip: true,
        tooltipOpts: {
            id: "tooltip",
            defaultTheme: false,
            content: "%s: %y"
        },
        yaxis: {
            min: 0
        },
        colors: [ "#62c462", "#f89406", "#ee5f5b", "#5bc0de" ]
    }

    function updatePlot(backend) {
        if (window.location.pathname.endsWith('/')) {
            var endpoint = window.location.pathname + backend +'/';
        } else {
            var endpoint = window.location.pathname + '/' +  backend +'/';
        }

        $.getJSON(endpoint, function(data) {
            $.each(data.results, function(index, series) {
                //// set the yaxis mode
                flot_options.yaxis.mode = (typeof series[0].mode != "undefined") ? series[0].mode : null;

                //// update plot
                $.plot('#' + backend + (index+1), series, flot_options);
            });
        });
    }
    // }}}

    // Pie chart configuration options {{{
    var chart_options = {
        animation: {
            enabled: false
        },
        tooltip: {
            enabled: true,
            format:"decimal",
            percentPrecision: 2,
            font: { size: 14, color: '#1c1e22', family: 'Helvetica' },
            arrowLength: 10,
            customizeText: function() {
                return this.valueText + " - " + this.argumentText + " (" + this.percentText + ")";
            }
        },
        customizePoint: function (point) {
            if (point.argument.indexOf('active+clean') >= 0) {
                return {
                    color: '#62c462'
                }
            } else if (point.argument.indexOf('active') >= 0) {
                return {
                    color: '#f89406'
                }
            } else {
                return {
                    color: '#ee5f5b'
                }
            }
        },
        size: {
            height: 350,
            width: 315
        },
        legend: {
            visible: false
        },
        series: [{
            type: "doughnut",
            argumentField: "state_name",
            valueField: "count",
            label: {
                visible: false,
            }
        }]
    };
    // }}}

    // Convert bytes to human readable form {{{
    function fmtBytes(bytes) {
        if (bytes==0) { return "0 bytes"; }
        var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
        var e = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, e)).toFixed(2) + " " + s[e];
    }
    // }}}

    // Initialize unhealthy popover {{{
    $("#unhealthy_osds").popover({
        html: true,
        placement: 'bottom',
        trigger: 'hover'
    });
    // }}}

    // MAKE SECTION COLLAPSABLE {{{
    $('.cd-collapsable').on("click", function (e) {
        if ($(this).hasClass('cd-collapsed')) {
            // expand the panel
            $(this).parents('.panel').find('.panel-body').slideDown();
            $(this).removeClass('cd-collapsed');
        }
        else {
            // collapse the panel
            $(this).parents('.panel').find('.panel-body').slideUp();
            $(this).addClass('cd-collapsed');
        }
    });
    // }}}

    // GENERIC AJAX WRAPER {{{
    function ajaxCall(url, callback) {
        $.ajax({
          url: url,
          dataType: 'json',
          type: 'GET',
          data: null,
          contentType: 'application/json',
          success: callback,
          error: function() {
              // refresh last updated timestamp
              timeStamp = Math.floor(Date.now() / 1000);
              timeDiff = timeStamp - lastUpdatedTimestamp;

              if (lastUpdatedTimestamp == 0) {
                  lastUpdatedTimestamp = timeStamp - refreshInterval;
                  timeDiff = refreshInterval;
              }


              if (timeDiff > outDatedWarning) {
                  msg = 'Content has last been refreshed more than ' + timeDiff + ' seconds ago!';
                  $('#last_update').show();
                  $('#last_update').tooltip({
                      placement: 'bottom',
                  });
                  $('#last_update').attr('data-original-title', msg);
              }
          },
          timeout: (refreshTimeout * 1000)
        });
    }
    // }}}

    // CREATE A ALERT MESSAGE {{{
    function message(severity, msg) {
        if (severity == 'success') { icon = 'ok' }
        if (severity == 'warning') { icon = 'flash' }
        if (severity == 'danger') { icon = 'remove' }
        return '<div class="alert alert-' + severity + '"><strong><span class="glyphicon glyphicon-' + icon + '">&nbsp;</span>' + msg + '</strong></div>';
    }
    // }}}

    // CREATE PANEL {{{
    function panel(severity, titel, message) {
        tmp = '<div class="panel panel-' + severity + '">';
        tmp = tmp + '<div class="panel-heading">' + titel + '</div>';
        tmp = tmp + '<div class="panel-body" align="center">';
        tmp = tmp + '<h1>' + message + '</h1>';
        tmp = tmp + '</div>';
        tmp = tmp + '</div>';
        return tmp;
    }
    // }}}

    // MAPPING DASHOPS TO BOOTSTRAP {{{
    var dash2bootstrap = {
        HEALTH_OK: 'success',
        HEALTH_WARN: 'warning',
        HEALTH_ERR: 'danger',
        down: 'warning',
        out: 'danger'
    }
    // }}}

    // INITIALIZE EMPTY PIE CHART {{{
    $("#pg_status").dxPieChart($.extend(true, {}, chart_options, {
        dataSource: []
    }));
    // }}}

    // WORKER FUNCTION (UPDATED) {{{
    function worker() {
        callback = function(data, status, xhr) {
            // refresh last updated timestamp
            timeStamp = Math.floor(Date.now() / 1000);
            lastUpdatedTimestamp = timeStamp;
            $('#last_update').hide();

            // load all relevant data from retrieved json {{{
            // ----------------------------------------------------------------
            numInDev = data['dc2']['num_in_dev'];
            numInTest = data['dc2']['num_in_test']
            numInAcc = data['dc2']['num_in_acc']
            numInProd = data['dc2']['num_in_prod']
            numInDMZDev = data['dmz']['num_in_dev'];
            numInDMZTest = data['dmz']['num_in_test']
            numInDMZAcc = data['dmz']['num_in_acc']
            numInDMZProd = data['dmz']['num_in_prod']
            // }}}

            // Update overall the values in the webpage
            $("#num_in_dev").html(numInDev);
            $("#num_in_test").html(numInTest);
            $("#num_in_acc").html(numInAcc);
            $("#num_in_prod").html(numInProd);
            $("#num_in_dmz_dev").html(numInDMZDev);
            $("#num_in_dmz_test").html(numInDMZTest);
            $("#num_in_dmz_acc").html(numInDMZAcc);
            $("#num_in_dmz_prod").html(numInDMZProd);
        }

        ajaxCall(window.location.pathname, callback);
    };
    worker();
    setInterval(worker, (refreshInterval * 1000));
    // }}}
})

// vim: set foldmethod=marker foldlevel=0 ts=4 sts=4 filetype=javascript fileencoding=utf-8 formatoptions+=ro expandtab:
