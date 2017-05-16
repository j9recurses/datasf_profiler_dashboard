//let url = "https://data.sfgov.org/resource/727n-u3zg.json?$query=SELECT fiscal_year,  revenue_or_spending, SUM(amount) as AMOUNT WHERE  revenue_or_spending = 'Spending' GROUP BY  revenue_or_spending, fiscal_year ORDER BY fiscal_year"
let baseUrl = 'https://data.sfgov.org/resource/'
let fbf = '8ez2-fksg'
let qryParmsBase = '.json?$query=SELECT '
let daySinceLast = 'days_since_last_updated, COUNT(*) as count GROUP BY days_since_last_updated'
let qryDaysSinceLastUpdt  = baseUrl + fbf + qryParmsBase + daySinceLast
let grpLookupDaysDict = {1: '1 Day', 4: '4 days', 7: '7 Days', 30: '30 Days', 90: '90 Days', 180: '180 Days', 365: '365 Days', 366:'>= 365 Days'}


function grpResults (dictObj, field, obj) {
  let dictList = Object.keys(dictObj)
  if (parseFloat(obj[field]) > dictList[dictList.length -1 ]) {
    obj[field + "_label"] = dictObj[dictList[dictList.length -1 ]]
    obj[field + '_val'] = dictList[dictList.length -1 ]
    return obj
  } else {
    for (let i = 0; i < dictList.length; i++) {
      if (parseFloat(obj[field]) <= dictList[i]) {
        obj[field +'_label'] = dictObj[dictList[i]]
        obj[field + '_val'] = dictList[i]
        return obj
      }
    }
  }
}

function sumGrpResults(obj, resultsObj, field){
  if (resultsObj.hasOwnProperty(obj[field + "_label"])) {
      resultsObj[obj[field + "_label"]] = resultsObj[obj[field + "_label"]] + parseFloat(obj['count'])
    } else {
      resultsObj[obj[field + "_label"]] = parseFloat(obj.count)
    }
}



let dataDaysSinceLastUpdt = d3.json(qryDaysSinceLastUpdt).then(function(response) {
  let results = response.map(function(obj){
    return grpResults(grpLookupDaysDict, 'days_since_last_updated', obj)
  })

  let grpedResults = {}
  results.forEach(function (obj) {
    sumGrpResults(obj, grpedResults, 'days_since_last_updated')
  })


  $('#containerLastUpdt').highcharts({
        plotOptions: {column: {colorByPoint: true}},

        chart: {
            type: 'bar'
        },
        title: {
            text: 'Datasets By Number of Days Since Last Update'
        },
        xAxis: {
            categories: Object.keys(grpedResults),
            title: {text: 'Days Since A Dataset was Last Updated'}
        },
        yAxis: {
            title: {
                text: 'Dataset Count'
            }
        },
        plotOptions: {
            series: {
                colorByPoint: true
            }
        },
        series: [{
            name: 'dataset count',
            data: Object.values(grpedResults)
        }],
        credits: {
          enabled: false
        },
    })
})
let updateFreq = 'publishing_frequency, COUNT(*) as count WHERE publishing_frequency IS NOT NULL  GROUP BY publishing_frequency |> SELECT publishing_frequency, count, '

let pubFreqDayDict = {'As needed': 366, 'Daily': 1, 'Weekly': 7, 'Bi-weekly': 4,  'Not updated (historical only)': 366,
                         'Quarterly':90,'Annually':365, 'Bi-annually': 180, 'Monthly': 30, 'Streaming': 367 }
function getFreqDays (arr, key) {
  arr.push("publishing_frequency = '" + key + "'," + pubFreqDayDict[key])
}
let caseStatementFreq = []
Object.keys(pubFreqDayDict).forEach(function (key) {
  return getFreqDays(caseStatementFreq, key)
})

caseStatementFreq = 'CASE( ' +  caseStatementFreq.join(' ,' ) + ') as freqDays ORDER BY freqDays'
let qryUpdateFreq  = baseUrl + fbf + qryParmsBase + updateFreq + caseStatementFreq
console.log(qryUpdateFreq)
let dataUpdateFreq = d3.json(qryUpdateFreq).then(function(response) {
  $('#containerUpdtFreq').highcharts({
        plotOptions: {column: {colorByPoint: true}},

        chart: {
            type: 'bar'
        },
        title: {
            text: 'Datasets By Reported Publishing Frequency'
        },
        xAxis: {
            categories: response.map(function(obj){return obj.publishing_frequency}),
            title: {text: 'Reported Publishing frequency'}
        },
        yAxis: {
            title: {
                text: 'Dataset Count'
            }
        },
        plotOptions: {
            series: {
                colorByPoint: true
            }
        },
        series: [{
            name: 'dataset count',
            data: response.map(function(obj){return parseInt(obj.count)})
        }],
        credits: {
          enabled: false
        },
    })
})



let docmtedCols = 'documented_percentage, COUNT(*) as count GROUP BY documented_percentage'
let docmtedDict =  {0.01:'>1%', 0.05: '5%', 0.25:'25%', 0.50:'50%', 0.75: '75%',  0.95: '95%'}
//function percentilesCase(val, key){
//  return key + " < "
//}
let qryDocPrct  = baseUrl + fbf + qryParmsBase + docmtedCols
let dataDocmted = d3.json(qryDocPrct).then(function(response) {
  let results = response.map(function(obj){
    return grpResults(docmtedDict, 'documented_percentage', obj)
  })

  let grpedResults = {}
  results.forEach(function (obj) {
    sumGrpResults(obj, grpedResults, 'documented_percentage')
  })
  $('#containerDatasetsDocumented').highcharts({

        chart: {
            type: 'column'
        },
        title: {
            text: 'Dataset Count by Percentage of Documented Fields'
        },
        xAxis: {
            categories: Object.keys(grpedResults),
            title: {text: 'Dataset Count by Percentage of Documented Fields'}
        },
        yAxis: {
            title: {
                text: 'Dataset Count'
            }
        },
        series: [{
            name: 'dataset count',
            data: Object.values(grpedResults)
        }],
        credits: {
          enabled: false
        },
    })

})


let glblsCols = 'global_field_percentage, COUNT(*) as count GROUP BY global_field_percentage'
let qryGlobalsPrct  = baseUrl + fbf + qryParmsBase + glblsCols
let globalPrct = d3.json(qryGlobalsPrct).then(function(response) {
  let results = response.map(function(obj){
    return grpResults(docmtedDict, 'global_field_percentage', obj)
  })

  let grpedResults = {}
  results.forEach(function (obj) {
    sumGrpResults(obj, grpedResults, 'global_field_percentage')
  })
  $('#containerGlobalFields').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Dataset Count by Percentage of Global Fields'
        },
        xAxis: {
            categories: Object.keys(grpedResults),
            title: {text: 'Datasets by Percentage of Global Fields'}
        },
        yAxis: {
            title: {
                text: 'Dataset Count'
            }
        },
        series: [{
            name: 'dataset count',
            data: Object.values(grpedResults)
        }],
        credits: {
          enabled: false
        },
    })

})

let dupeCols = 'dupe_record_percent, COUNT(*) as count GROUP BY dupe_record_percent'
let qryDupePrct  = baseUrl + fbf + qryParmsBase + dupeCols
let dupePrct = d3.json(qryDupePrct).then(function(response) {
  let results = response.map(function(obj){
    return grpResults(docmtedDict, 'dupe_record_percent', obj)
  })

  let grpedResults = {}
  results.forEach(function (obj) {
    sumGrpResults(obj, grpedResults, 'dupe_record_percent')
  })
  $('#containerDupePct').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Dataset Count by Percentage of Rows that are Exact Duplicates'
        },
        xAxis: {
            categories: Object.keys(grpedResults),
            title: {text: 'Dataset Count by Percentage of Rows that are Exact Duplicates'}
        },
        yAxis: {
            title: {
                text: 'Dataset Count'
            }
        },
        series: [{
            name: 'dataset count',
            data: Object.values(grpedResults)
        }],
        credits: {
          enabled: false
        },
    })

})



$(function() {
  $("#documentationInfo").children().hide();
  $("#globalInfo").children().hide();
  $("#dupeInfo").children().hide();
  $("#documentation").click(function() {
    setTimeout(function() {
    $("#timelessnesInfo").children().hide();
    $("#globalInfo").children().hide();
    $("#dupeInfo").children().hide();
    $("#documentationInfo").children().show();
      }, 200);
  });

  $("#timelessness").click(function() {
    setTimeout(function() {
    $("#timelessnesInfo").children().show();
    $("#globalInfo").children().hide();
    $("#dupeInfo").children().hide();
    $("#documentationInfo").children().hide();
      }, 200);
  });
  $("#globals").click(function() {
    setTimeout(function() {
    $("#globalInfo").children().show();
    $("#timelessnesInfo").children().hide();
    $("#dupeInfo").children().hide();
    $("#documentationInfo").children().hide();
      }, 200);
  });
   $("#dupes").click(function() {
    setTimeout(function() {
    $("#timelessnesInfo").children().hide();
    $("#documentationInfo").children().hide();
    $("#globalInfo").children().hide();
    $("#dupeInfo").children().show();
      }, 200);
  });

});
