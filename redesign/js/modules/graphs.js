var app = app || {};

app.graphs = function() {


  var dataWrapper, chartOverviewElm, chartDetailElm, filterElm, filterType, filterOffset,
        firstDate = Infinity, selectedSp, wrapperElm, isGod, compoundServiceProviders,
    selectedIdp;


  var DataWrapper = function(isGod) {

    var masterData,

    consolidateSPs = function() {
      var data = masterData;

      if (data.length === 0) {
        return data;
      }
      data.sort(function(a, b) {
        return a.spEntityId > b.spEntityId ? 1 : ((b.spEntityId > a.spEntityId) ? -1 : 0);
      });
      var result = [];
      var previous = copySpDataObject(data[0]);
      for ( var i = 1, l = data.length; i < l; ++i) {
        if (previous.spEntityId === data[i].spEntityId) {
          var next = data[i];
          /*
           * now enrich/merge the previous with the data[i]
           */
          var interval = previous.pointInterval;

          var end = Math.max(previous.pointStart + (interval * previous.data.length), next.pointStart
            + (interval * next.data.length));
          var start = Math.min(previous.pointStart, next.pointStart);

          var nbrOfDays = Math.round((end - start) / interval);
          /*
           * Create a new array for the previous.data with the two data sets
           * combined
           */
          var newData = [];
          for ( var j = 0; j < nbrOfDays; ++j) {
            newData.push(getLoginsForData(previous, start) + getLoginsForData(next, start));
            start += interval;
          }
          previous.data = newData;
          previous.pointStart = Math.min(previous.pointStart, next.pointStart);
          previous.total += next.total;

        } else {
          result.push(previous);
          previous = copySpDataObject(data[i]);
        }
      }
      return result;
    };


    return {

      getSpEntityIdByName: function(str) {
        var dataElement = $.grep(masterData, function(n) {
          return n.name.substring(0, str.length) === str;
        });
        return dataElement[0].spEntityId;
      },
      getAggregatedBySp: function() {
        return consolidateSPs();
      },
      setData: function(data) {
        masterData = data;
      },
      getAllData: function (deepCopy) {
        var data = isGod ? this.getAggregatedBySp() : masterData;
        if (deepCopy) {
          return $.extend(true, [], data);
        }
        return data;
      },

      getBySp: function(spEntityId) {
        var dataForSp = $.grep(this.getAllData(), function(n) {
          return n.spEntityId == spEntityId;
        });
        return (dataForSp.length == 1 ? dataForSp[0] : {});
      },

      getByIdp: function(idpEntityId) {
        return $.grep(masterData, function(n) {
          return n.idpEntityId === idpEntityId;
        });
      },

      getBySpAndIdp: function(spEntityId, idpEntityId) {
        var dataForSpAndIdp = $.grep(masterData, function(n) {
          return (n.idpEntityId === idpEntityId && (spEntityId === undefined || n.spEntityId == spEntityId));
        });
        return (dataForSpAndIdp.length == 1 ? dataForSpAndIdp[0] : {});
      },

      // Put the data in a new array, with the name, total, spEntityId and index; order it.
      // TODO can we use objects instead of plain arrays here?
      formatForOverview: function(data) {
        var newArray = [];

        for ( var i = 0, l = data.length; i < l; ++i) {
          newArray.push([ data[i].name, data[i].total, data[i].spEntityId,  i ]);
        }

        newArray.sort(function(a, b) {
          if (a[1] < b[1]) {
            return 1;
          }
          if (a[1] > b[1]) {
            return -1;
          }
          return 0;
        });

        return newArray;
      }
    }
  };

  filterType = 'all';
  filterOffset = 0;

  var init = function() {
    chartOverviewElm = $('#sp-overview-chart');
    chartDetailElm = $('#sp-detail-chart');

    // Only launch graphs app when these elements are on the apge
    if (chartOverviewElm.length === 0 || chartDetailElm.length === 0) {
      return;
    }

    wrapperElm = $('.statistics-holder');
    isGod = chartOverviewElm.data('is-god');
    dataWrapper = DataWrapper(isGod);

    if (isGod) {
      wrapperElm.addClass('statistics-holder-idp-switch');
      $('#idp-select2').select2({
        placeholder : app.message.i18n('stats.select_idp')
      }).change(idpChange);
    }

    // Fetch dependencies
    var highcharts = $.ajax({
      url : contextPath + '/js/highcharts.js',
      cache : true,
      dataType : 'script'
    });

    var jsonUrl = (isGod ? '/stats/loginsperspperday.json' : '/stats/loginsperspperdaybyidp.json')

    var jqXhrDataCall = $.ajax({
      url : contextPath + jsonUrl,
      cache : true,
      dataType : 'json'
    });

    $.ajax({
      url : contextPath + '/stats/spcspcombis.json',
      cache : true,
      dataType : 'json'
    }).done(function(csps){
      compoundServiceProviders = csps; 
    });

    // Get the (by controller provided) selected SP Entity ID.
    selectedSp = chartDetailElm.data("spentityid");
    if (!selectedSp || selectedSp.length == 0) {
      selectedSp = null;
    }

    $.when(highcharts, jqXhrDataCall).done(function(highcharts, jqXhrDataCall) {
      dataWrapper.setData(jqXhrDataCall[0]);
      determineDateFilterOffset();
      initRendering();
    });

    initFilters();
  };


  var determineDateFilterOffset = function() {

    var data = dataWrapper.getAllData();
    for ( var i = 0, l = data.length; i < l; ++i) {
      if (firstDate > data[i].pointStart) {
        firstDate = data[i].pointStart;
      }
    }
    filterOffset = firstDate;
  }

  var idpChange = function() {

    var newIdp = $("#idp-select2 option:selected").val();
    selectedIdp = newIdp;

    if (selectedSp) {
      initDetailRendering(selectedSp);
    } else if (newIdp === '') {
      renderOverview(dataWrapper.getAllData(true));
    } else {
      renderOverview(dataWrapper.getByIdp(newIdp));
    }
  }

  var filterOutIdp = function(data, newIdp, spEntityId) {
    var newArray = [];
    for ( var i = 0, l = data.length; i < l; ++i) {
      if (data[i].idpEntityId === newIdp && (spEntityId === undefined || data[i].spEntityId == spEntityId)) {
        newArray.push(data[i]);
      }
    }
    return newArray;
  }

  var initI18n = function() {
    Highcharts.setOptions({
      global : {
        // Data is in local timezone
        useUTC : false
      },
      lang : {
        resetZoom : app.message.i18n('stats.reset_zoom'),
        shortMonths : app.message.i18n('stats.short_months').split('|')
      }
    });
  };

  var initFilters = function() {
    filterElm = $('.statistics-filters');

    filterElm.on('click', '.show a', setTimeframe);
    filterElm.on('change', '#choose-time-offset', setTimeframe);

    wrapperElm.on('click', '.back', function() {
      chartDetailElm.stop().fadeOut(100);
      selectedSp = null;
      idpChange();
    });
  };

  var initRendering = function() {
    initI18n();

    chartOverviewElm.removeClass('ajax-loader');


    if (selectedSp) {
      initDetailRendering(selectedSp);
    } else {
      var filteredData = filterData(dataWrapper.getAllData(true), filterType, filterOffset);
      renderOverview(filteredData);
    }
    filterElm.find('.show a:first').trigger('click');
  };

  var renderOverview = function(data, title) {

    if (title === undefined) {
      title = app.message.i18n('stats.title.overview_default')
    }

    var formattedData = dataWrapper.formatForOverview(data),
      categories = formatCategories(formattedData),
      height = Math.max(formattedData.length * 40 + 150, 400);

    chartDetailElm.stop().fadeOut(100);
    chartOverviewElm.closest('section').height(height);

    $('.back, .forward', wrapperElm).addClass('hide');

    chartOverviewElm.stop().fadeIn(100).promise().done(function() {
      var chart = new Highcharts.Chart({
        chart : {
          animation : false,
          height : height,
          renderTo : chartOverviewElm.attr('id'),
          type : 'bar'
        },
        credits : {
          enabled : false
        },
        plotOptions : {
          bar : {
            animation : false,
            borderColor : '#4FB3CF',
            borderWidth : 1,

            dataLabels : {
              enabled : true
            },
            events : {
              click : function(e) {
                /*
                 e is the event, enriched with highcharts stuff.
                 e.point is the original data point we 'formatted'.
                 Therefore, the spEntityId is e.point.config[2].
                  */
                var spEntityId = e.point.config[2];
                selectedSp = spEntityId;
                initDetailRendering(spEntityId);
              }
            },
            fillColor : {
              linearGradient : {
                x1 : 0,
                y1 : 0,
                x2 : 0,
                y2 : 1
              },
              stops : [ [ 0, 'rgba(79, 179, 207, 0.75)' ], [ 1, 'rgba(79, 179, 207, 0.2)' ] ]
            },
            color : '#4FB3CF',
            pointPlacement : null,
            shadow : false,
            pointPadding : 0.2,
            minPointLength : 10
          }
        },
        series : [ {
          data : formattedData,
          name : 'SPs'
        } ],
        title : {
          text : title
        },
        xAxis : {
          categories : categories,
          labels : {
            enabled : true
          },
          lineColor : '#7F7F7F',
          title : {
            enabled : false
          }
        },
        yAxis : {
          gridLineColor : '#E5E5E5',
          gridLineWidth : 1,
          title : {
            text : app.message.i18n('stats.total_logins'),
            style : {
              color : '#7F7F7F'
            }
          }
        }
      });

      $('.highcharts-axis-labels:first tspan', chartOverviewElm).on('click', function(e) {
        selectedSp = dataWrapper.getSpEntityIdByName($(this).text());
        initDetailRendering(selectedSp);
      }).hover(function() {
        $(this).parent().css({
          cursor : 'pointer',
          fill : '#4FB3CF'
        });
      }, function() {
        $(this).parent().css({
          cursor : 'default',
          fill : '#666'
        });
      });
    });
  };
  var renderDetailChart = function(data, title) {

    $('.back', wrapperElm).removeClass('hide');
    showLinkToDetail(data);
    
    chartOverviewElm.stop().fadeOut(100).promise().done(function() {
      chartDetailElm.stop().fadeOut(100).promise().done(function() {
        createDetailChart(data, title);
        chartDetailElm.closest('section').height(400);
        chartDetailElm.fadeIn(100);
      });
    });
  };
  
  var showLinkToDetail = function(data) {
    for ( var i = 0, l = compoundServiceProviders.length; i < l; ++i) {
      if (compoundServiceProviders[i].spEntityId === data.spEntityId) {
        var forward = $('.forward', wrapperElm);
        forward.attr('href',contextPath + '/app-detail.shtml?compoundSpId=' + compoundServiceProviders[i].compoundServiceProviderId);
        forward.removeClass('hide');
      }
    }
  };

  var createDetailChart = function(data, title) {
    return new Highcharts.Chart({
      chart : {
        animation : false,
        renderTo : chartDetailElm.attr('id'),
        type : 'areaspline',
        zoomType : 'x'
      },
      credits : {
        enabled : false
      },
      plotOptions : {
        areaspline : {
          animation : false,
          borderWidth : 0,
          fillColor : 'rgba(79, 179, 207, 0.2)',
          color : '#4FB3CF',
          pointPlacement : null,
          shadow : false,
          pointPadding : 0.2
        }
      },
      series : [ {
        name : app.message.i18n('stats.logins'),
        data : data.data,
        pointStart : Math.max(data.pointStart, filterOffset),
        pointInterval : data.pointInterval
      } ],
      tooltip : {
        pointFormat : '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
        valueDecimals : 0,
        shared : true
      },
      title : {
        text : title
      },
      xAxis : {
        type : 'datetime',
        lineColor : '#7F7F7F',
        maxZoom : 4 * 24 * 3600000
      },
      yAxis : {
        gridLineColor : '#E5E5E5',
        gridLineWidth : 1,
        title : {
          text : app.message.i18n('stats.logins_per_day'),
          style : {
            color : '#7F7F7F'
          }
        }
      }
    });
  }

  var initDetailRendering = function(spEntityId) {

    var data = (selectedIdp && selectedIdp !== '') ? dataWrapper.getBySpAndIdp(spEntityId, selectedIdp) : dataWrapper.getBySp(spEntityId);

    var title;
    if (data.data) {
      title = app.message.i18n('stats.title.sp_overview').replace('#{sp}', data.name)
        .replace('#{total}', data.total);
    } else {
      title = "No data";
    }

    if (filterType !== 'all') {
      title += ' over ' + $('#choose-time-offset option:selected').text();
    }

    // give filterData() [data] instead of data, because it only accepts (and returns) an array of data blocks.
    renderDetailChart(filterData([data], filterType, filterOffset)[0], title);
  };

  var setTimeframe = function(e) {
    e.preventDefault();

//    console.log("setTimeframe()");

    var elm = $(this), menuItems;

    if (elm.is('a')) {
      filterType = elm.attr('data-show');
      filterOffset = getDateOffset(firstDate, filterType);
      menuItems = getMenuItems(filterOffset, filterType); // get an object with
      // time-friendly time
      // ranges
      filterOffset = buildMenu(menuItems); // returns the last time offset

      elm.closest('div').find('.active').removeClass('active');
      elm.addClass('active');
    } else {
      filterOffset = elm.val();
    }
    filterOffset = parseInt(filterOffset, 10);
//    console.log("filterOffset: " + new Date(filterOffset));
//    console.log("selectedSp: " + selectedSp);

    if (selectedSp) {
      initDetailRendering(selectedSp);
    } else {
      var title;
      if (filterType === 'all') {
        title = app.message.i18n('stats.title.overview_default');
      } else {
        title = app.message.i18n('stats.title.overview_zoomed').replace('#{range}', $('#choose-time-offset option:selected').text());
      }
      renderOverview(filterData(dataWrapper.getAllData(), filterType, filterOffset), title);
    }
  };

  var getDateOffset = function(firstDate, filterType) {
//    console.log("firstDate: " + new Date(firstDate ) + ", filterType: " + filterType);
    var date = new Date(firstDate), first, refDate;

    switch (filterType) {
    case 'week':
      first = date.getTime() - date.getDay() * 60 * 60 * 24 * 1000;
      refDate = new Date(first);
      break;
    case 'month':
      first = date.getTime() - (date.getDate() - 1) * 60 * 60 * 24 * 1000;
      refDate = new Date(first);
      break;
    case 'quarter':
      first = date.getTime() - (date.getDate() - 1) * 60 * 60 * 24 * 1000;
      var newDate = new Date(first), newMonth = newDate.getMonth(), refMonth = 0;
      if (newMonth > 2) {
        refMonth = 3;
      }
      if (newMonth > 5) {
        refMonth = 6;
      }
      if (newMonth > 8) {
        refMonth = 9;
      }
      refDate = new Date(newDate.getFullYear(), refMonth, 1);
      break;
    default:
      refDate = date;
      break;
    }

    return refDate;
  };

  var getMenuItems = function(dateOffset, filterType) {
    var day = 24 * 60 * 60 * 1000, months = app.message.i18n('stats.menu.months').split('|'), today = new Date(), dates = {}, dateOffsetTime = dateOffset
        .getTime(), display = true, newMonth, newYear;

    switch (filterType) {
    case 'week':
      while (dateOffset < today) {
        dateOffsetTime = dateOffset.getTime();
        dates[dateOffsetTime] = app.message.i18n('stats.weekof').replace('#{week}', dateOffset.getWeek()).replace(
            '#{year}', dateOffset.getFullYear());
        dateOffset = new Date(dateOffsetTime + day * 7);
      }
      break;
    case 'month':
      while (dateOffset < today) {
        dateOffsetTime = dateOffset.getTime();
        dates[dateOffsetTime] = months[dateOffset.getMonth()] + ' ' + dateOffset.getFullYear();
        newMonth = dateOffset.getMonth() + 1;
        newYear = dateOffset.getFullYear();
        if (newMonth === 12) {
          newMonth = 0;
          ++newYear;
        }
        dateOffset = new Date(newYear, newMonth, 1);
      }
      break;
    case 'quarter':
      while (dateOffset < today) {
        dateOffsetTime = dateOffset.getTime();
        dates[dateOffsetTime] = 'Q' + Math.floor((dateOffset.getMonth() + 3) / 3) + ' ' + dateOffset.getFullYear();
        newMonth = dateOffset.getMonth() + 3;
        newYear = dateOffset.getFullYear();
        if (newMonth === 12) {
          newMonth = 0;
          ++newYear;
        }
        dateOffset = new Date(newYear, newMonth, 1);
      }
      break;
    default:
      display = false;
    }

    return {
      display : display,
      dates : dates
    };
  };

  // Create a dropdown list of all menu items
  var buildMenu = function(menuItems) {
    var menu = $('#choose-time-offset');

    $('option', menu).remove();

    var maxTime = 0;

    if (menuItems.display) {
      $.each(menuItems.dates, function(time, text) {
        menu.prepend('<option value="' + time + '">' + text + '</option>');
        if (time > maxTime) {
          maxTime = time;
        }
      });
      menu.attr('disabled', false);
    } else {
      menu.attr('disabled', true);
    }

    $('option:first', menu).attr('selected', true);

    return maxTime;
  };


  var getLoginsForData = function(data, start) {
    if (start < data.pointStart) {
      return 0;
    }
    if (start > (data.pointStart + (data.pointInterval * data.data.length))) {
      return 0;
    }
    var pos = Math.round((start - data.pointStart) / data.pointInterval);
    // better be on the safe side with extra check
    return (pos < data.data.length) ? data.data[pos] : 0;
  }

  /*
   * To maintain two sets of data (one consolidated for all Idp's and one per
   * Idp) we need to make deep copies as we otherwise end up with
   * cross-references between the two datasets. Note that we don't copy the
   * idpEntityId as this does not make sense in consolidated set. We also copy
   * the dataInstance.data as it might be that there is only one Sp presence
   * 
   * We could use jQuery extend, but it would be overkill
   * 
   * TODO jQuery.extend(true, {}, dataInstance)
   */
  var copySpDataObject = function(dataInstance) {
    return {
      'name' : dataInstance.name,
      'pointInterval' : dataInstance.pointInterval,
      'pointStart' : dataInstance.pointStart,
      'spEntityId' : dataInstance.spEntityId,
      'total' : dataInstance.total,
      'data' : dataInstance.data.slice(0)
    };
  }

  // Slice of data from the beginning and end of the arrays, to fit the
  // specified time filters
  var filterData = function(data, filterType, filterOffset) {

    firstDate = Infinity;
    var mutableData, dataOffset, dataInterval, spliceTil, total, spliceFrom = Infinity;

    mutableData = $.extend(true, [], data);

    switch (filterType) {
    case 'week':
      spliceFrom = 7;
      break;
    case 'month':
      spliceFrom = 30;
      break;
    case 'quarter':
      spliceFrom = 90;
      break;
    default:
      spliceFrom = Infinity;
    }

    for ( var i = 0, l = mutableData.length; i < l; ++i) {
      if (!mutableData[i].data) {
        continue;
      }
      dataOffset = mutableData[i].pointStart, dataInterval = mutableData[i].pointInterval, spliceTil = 0;

      // Calculate start offset from start date in data and filter date
      if (dataOffset <= filterOffset) {
        spliceTil = Math.round((filterOffset - dataOffset) / dataInterval);
      }


      mutableData[i].data.splice(0, spliceTil);
      mutableData[i].data.splice(spliceFrom, Infinity);

      // Calculate new totals
      // Calculate new totals
      total = 0;
      for ( var j = 0, m = mutableData[i].data.length; j < m; ++j) {
        total += mutableData[i].data[j];
      }
      mutableData[i].total = total;

      if (firstDate > mutableData[i].pointStart) {
        firstDate = mutableData[i].pointStart;

      }

    }
    return mutableData;
  };


  // Names used in overview graph, take only a flat array with the titles.
  var formatCategories = function(data) {
    var newArray = [];

    for ( var i = 0, l = data.length; i < l; ++i) {
      newArray.push(data[i][0].substring(0, 30));
    }

    return newArray;
  };

  return {
    init : init
  };
}();

app.register(app.graphs);

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};