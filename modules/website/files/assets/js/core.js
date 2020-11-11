var covidBeacon = angular.module('covidBeacon', ['ngMaterial','ngRoute','angularUtils.directives.dirPagination'])
  .config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
      $locationProvider.hashPrefix('');
      $routeProvider.when('/home/', {
          templateUrl: 'views/table.html',
          controller: 'beacon',
      });
      $routeProvider.when('/about/', {
          templateUrl: 'views/about.html',
      });
      $routeProvider.otherwise({
      templateUrl: 'views/table.html',
          controller: 'beacon'
      });
}]);


covidBeacon.controller('beacon', function( $scope, $http, $q) {
  //GeoData can be collected from https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;alpha3Code


    var rootUrl = window.beacon_api_url;
    var url = rootUrl+ "/query";
    $scope.sPos, $scope.VarType,$scope.totalEntries,$scope.visualIndex;
    $scope.ref = $scope.alt ="";
    $scope.isVisible = $scope.loading = $scope.sortReverse  = $scope.stateVisilble =  false;
    $scope.subSortReverse = true;
    $scope.orderByField = 'name';
    $scope.inputText = $scope.hits = $scope.warning = $scope.sMin = $scope.sMax = $scope.eMin = $scope.eMax = null;
    $scope.sortType     = 'name';
    $scope.subSortType     = 'frequency';
    $scope.pages = [5 , 10, 25, 50, 100];
    $scope.usersPerPage = 25;
    $scope.currentPage = 1;
    $scope.sampleData = [];
    $scope.hashState = [];



    var queryData = "";
    $scope.rootQuery = [];
    function successCallback(response) {
      return response.data.datasets
    }

    //$scope.rootQuery = $http.get(rootUrl).then(successCallback);
    //console.log($scope.rootQuery);


    $scope.ShowHide = function(){
            $scope.isVisible = !$scope.isVisible;
    }
    $scope.stateToggle = function(){
            $scope.stateVisilble = !$scope.stateVisilble;
            console.log($scope.stateVisilble);
    }
    $scope.refresh = function(){
      location.reload(false);
    }
    $scope.refreshGraph = function(){
      $scope.graphDataGenerator($scope.hits,$scope.visualIndex);
    }
    $scope.search = function(searches){
      //console.log(searches);
      if(searches == 'D614G'){
        /*$scope.sPos = 23403;
        $scope.ref = "A";
        $scope.alt = "G";*/
        if($scope.isVisible == true){
          $scope.sMin = $scope.sMax = $scope.eMin = $scope.eMax = null;
          $scope.isVisible = false;
        }
        $scope.inputText= "23403 A>G";
        $scope.query();
      }
      if(searches == 'Y453F'){
        /*$scope.sPos = 23403;
        $scope.ref = "A";
        $scope.alt = "G";*/
        if($scope.isVisible == true){
          $scope.sMin = $scope.sMax = $scope.eMin = $scope.eMax = null;
          $scope.isVisible = false;
        }

        $scope.inputText= "22920 A>T";
        $scope.query();
      }
    }

    //$scope.pageChanged = function(id){
      //console.log(id);

      //queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "startMin":$scope.sMin-1,"startMax":$scope.sMax-1,"endMin":$scope.eMin-1,"endMax":$scope.eMax-1,"variantType":$scope.VarType};
      //getData(url,queryData)
    //}
    $scope.graphDataGenerator = function(hits, visIndex,location=null){
      //
      var dateData = [];
      var hashLoc = {};
      var hashDate = {};
      var hashState = {};

      var index = hits.findIndex(x => x.info.name === visIndex);
      var sampleDetails = hits[index].info.sampleDetails;
      var locationDetails = hits[index].info.locationCounts;
      var locationDateCounts = hits[index].info.locationDateCounts;
      var dateCounts = hits[index].info.dateCounts;



      if(location == null){
        //Sample based calculations
        for (var i = 0; i < sampleDetails.length; i++) {
          var valLoc = sampleDetails[i][1];
          var valDate = sampleDetails[i][0];
          var valState = sampleDetails[i][2];
          if (typeof hashLoc[valLoc] !== "undefined") {
            hashLoc[valLoc]++;
          }else{
            hashLoc[valLoc] = 1;
          }
          if (typeof hashDate[valDate] !== "undefined") {
            hashDate[valDate]++;
          }else{
            hashDate[valDate] = 1;
          }
          if (typeof hashState[valState] !== "undefined") {
            hashState[valState]++;
          }else{
            hashState[valState] = 1;
          }
        }
        console.log(hashState);
        //Calculating percentage - divinding sample based count to totalCount
        for(var i = 0; i < locationDetails.length; i++) {
          //console.log(Object.keys(locationDetails[i]));
          let key = Object.keys(locationDetails[i]);
          //var val = parseFloat((hashLoc[key]/locationDetails[i][key])*100).toFixed(2);
          if(typeof hashLoc[key] === "undefined"){
            var val = String(0+"/"+locationDetails[i][key]);
          }else{
            var val = String((hashLoc[key]+"/"+locationDetails[i][key]));
          }
          hashLoc[key]=val;
        }

        for(var i = 0; i < dateCounts.length; i++) {
          let key = Object.keys(dateCounts[i]);

          if(typeof hashDate[key] === "undefined"){
            var val = String(0+"/"+dateCounts[i][key]);
          }else{
            //var val = parseFloat((hashDate[key]/dateCounts[i][key])*100).toFixed(2);
            var val = String((hashDate[key]+"/"+dateCounts[i][key]));
          }
          hashDate[key]=val;
        }
        $scope.sampleData = [];
        //Creating array of objects for graphs
        for (var key in hashLoc) {
              $scope.sampleData.push({"code": key, "value": parseFloat((hashLoc[key].split("/")[0]/hashLoc[key].split("/")[1])*100).toFixed(2), "breakup": hashLoc[key]});
        }
        //console.log(hashDate);
        for (var key in hashDate) {
          //if( key == "N/A"){
          //  continue;
          //}
          //console.log(hashDate[key]);
              dateData.push({"date": key, "value": parseFloat((hashDate[key].split("/")[0]/hashDate[key].split("/")[1])*100).toFixed(2), "breakup" : hashDate[key], "location" : "all"});
        }
      }else{
        console.log(location);
        console.log($scope.hits);
        //Sample based calculations
        for (var i = 0; i < sampleDetails.length; i++) {
          var valDate = sampleDetails[i][0];
          if(sampleDetails[i][1] == location){
            if (typeof hashDate[valDate] !== "undefined") {
              hashDate[valDate]++;
            }else{
              hashDate[valDate] = 1;
            }
          }
        }

        var locDateValues = locationDateCounts[location];

        for(var i = 0; i < locDateValues.length; i++) {
          let key = Object.keys(locDateValues[i]);

          if(typeof hashDate[key] === "undefined"){
            var val = String(0+"/"+locDateValues[i][key]);
          }else{
            //var val = parseFloat((hashDate[key]/dateCounts[i][key])*100).toFixed(2);
            var val = String((hashDate[key]+"/"+locDateValues[i][key]));
          }
          hashDate[key]=val;
        }

        for (var key in hashDate) {
              dateData.push({"date": key, "value": parseFloat((hashDate[key].split("/")[0]/hashDate[key].split("/")[1])*100).toFixed(2), "breakup" : hashDate[key], "location":location});
        }


      }

      console.log($scope.sampleData);
      //console.log(dateData);
      generateMap($scope.sampleData,"choropleth",[' 0', ' 1% - 5%', ' 6% - 10%', '11% - 25%', '26% - 50%', '51% - 75%', '> 76%'],[1, 6, 11, 26, 51, 76])
      generateHistogram(dateData);
    }

    $scope.query = function(){
      $scope.loading = true;
      //do validation and throw error. Need to change assembly to  hCoV-19 later.
      if( $scope.sMin != null || $scope.sMax != null || $scope.eMin != null || $scope.eMax != null){
        $scope.inputText= null;
          if($scope.VarType != null ){
            $scope.alt = null;
            queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(), "startMin":$scope.sMin-1,"startMax":$scope.sMax-1,"endMin":$scope.eMin-1,"endMax":$scope.eMax-1,"variantType":$scope.VarType.toUpperCase(),"sampleFields":["SampleCollectionDate","Location","State"]};
          }
          if($scope.alt != null ){
            $scope.VarType = null;
            queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "startMin":$scope.sMin-1,"startMax":$scope.sMax-1,"endMin":$scope.eMin-1,"endMax":$scope.eMax-1,"sampleFields":["SampleCollectionDate","Location","State"]};
          }
      }else if( $scope.inputText != null){
        try {
          var regex = /^(\d+)(.+)/;
          var text = $scope.inputText.replace(/\,/g, '')
          var match = regex.exec(text);
          $scope.sPos = match[1];
        }
        catch(err) {
          $scope.warning = "Incorrect search formatting - Please enter valid position.";
          $scope.loading = false;
          return;
        }

        if((match[2].split(">").length !== 2)){
          $scope.warning = "Incorrect search formatting - Separate REF and ALT with '>'. ";
          $scope.loading = false;
          return;
        }
        $scope.ref = match[2].split(">")[0].trim();
        $scope.alt = match[2].split(">")[1].trim();
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "start":$scope.sPos-1,"variantType":$scope.VarType,"sampleFields":["SampleCollectionDate","Location","State"]};
      }
      getData(url,queryData)
    }

    var getData = function(url,queryData){
      //console.log(url,queryData);
      $http({method: 'GET', url: url,params:queryData}).then(function successCallback(resp) {
        var hits = resp.data;
        //console.log(hits);
        $scope.hits = [];
        if(hits.s3Response){
          var newUrl = rootUrl +"/s3response/"+hits.s3Response.key;
          //console.log(newUrl);
          $http({method: 'GET', url: newUrl}).then(function successCallback(resp) {
            hits = resp.data;
            if( hits.exists == true){
              $scope.warning = null;
              $scope.hits =hits.datasetAlleleResponses;
              //console.log($scope.hits);
              $scope.loading = false;
              const maxDatasetId = $scope.hits.sort((a, b) => b.callCount - a.callCount)[0];
              $scope.visualIndex = maxDatasetId.info.name;
              $scope.graphDataGenerator($scope.hits,$scope.visualIndex);
              let hashState = {};
              var search = "AUS";
              var condition = new RegExp(search);
              let sampleDetails = $scope.hits[0].info.sampleDetails.filter(e => e[1] == "AUS");
              for (var j = 0; j < sampleDetails.length; j++){
                var valState = sampleDetails[j][2];
                if (typeof hashState[valState] !== "undefined") {
                  hashState[valState]++;
                }else{
                  hashState[valState] = 1;
                }
              }

              angular.forEach(hashState, function(value, key) {
                  $scope.hashState.push({
                      key: key,
                      count: value
                  });
              });

              console.log($scope.hashState);



            }else if(hits.error == true){
              $scope.warning = hits.error.errorMessage;
              $scope.hits = null;
              $scope.loading = false;
            }else{
              $scope.hits = null;
              $scope.warning = "No hits matching the search criteria";
              console.log($scope.warning );
              $scope.loading = false;
            }
          }, function errorCallback(resp) {
                console.log("Error: " + JSON.stringify(resp));
                $scope.warning = resp.data.error.errorMessage;
                $scope.hits = null;
                $scope.loading = false;
          });
        }else if( hits.exists == true){
          $scope.warning = null;
          $scope.hits =hits.datasetAlleleResponses;
          console.log($scope.hits);
          $scope.loading = false;
          const maxDatasetId = $scope.hits.sort((a, b) => b.callCount - a.callCount)[0];
          $scope.visualIndex = maxDatasetId.info.name;
          console.log($scope.visualIndex);
          $scope.graphDataGenerator($scope.hits,$scope.visualIndex);
          let hashState = {};
          var search = "AUS";
          var condition = new RegExp(search);
          let sampleDetails = $scope.hits[0].info.sampleDetails.filter(e => e[1] == "AUS");
          for (var j = 0; j < sampleDetails.length; j++){
            var valState = sampleDetails[j][2];
            if (typeof hashState[valState] !== "undefined") {
              hashState[valState]++;
            }else{
              hashState[valState] = 1;
            }
          }
          angular.forEach(hashState, function(value, key) {
              $scope.hashState.push({
                  key: key,
                  count: value
              });
          });
          console.log($scope.hashState);

        }else if(hits.error == true){
          $scope.warning = hits.error.errorMessage;
          $scope.hits = null;
          $scope.loading = false;
        }else{
          $scope.hits = null;
          $scope.warning = "No hits matching the search criteria";
          console.log($scope.warning );
          $scope.loading = false;
        }
      }, function errorCallback(resp) {
          console.log("Error: " + JSON.stringify(resp));
          $scope.warning = resp.data.error.errorMessage;
          $scope.hits = null;
          $scope.loading = false;
      });
    }


      var generateMap = function(sampleData, divID, labels, domain){
        d3.select(".legendThreshold").remove();
        d3.select('#'+divID).selectAll("svg").remove();
        var width = parseInt(d3.select('#'+divID).style('width'), 10);
        var height = parseInt(d3.select('#'+divID).style('height'), 10);
        var lowColor = '#ccdef0'
        var highColor = '#225487'//'#477fb6'



        var svg = d3.select("body").select('#'+divID)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(d3.zoom().on("zoom", function () {
                    svg.attr("transform", d3.event.transform)
                 }))
                 .append("g");


        // Map and projection

        var projection = d3.geoMercator()
            .scale(width / 2.7 / Math.PI)
            .translate([width / 2, height/1.6 ])
        var path = d3.geoPath()
            .projection(projection);



        // Data and color scale
        var data = d3.map();


        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function(d) {
          var breakup;
          sampleData.forEach(function(n){
            if(d.id == n.code){
              breakup = n.breakup;
            }
          });
          if(d.properties.name == "England"){
            return "United Kingdom : " + d.value+"%";
          }else{
            if(typeof breakup === "undefined"){
              return d.properties.name + ": No data ("+ d.value+"%)";
            }else{
              return d.properties.name + ": " + breakup+" ("+ d.value+"%)";
            }

          }
        })
        svg.call(tip);

        //var promises = [
        //  d3.json("assets/geojson/world.geojson"),
        //  sampleData.forEach(function(d){data.set(d.code, +d.value);})
        //]

        //Promise.all(promises).then(ready)
        d3.json("assets/geojson/world.geojson")
        .then(function(topo) {
            console.log(topo)
            sampleData.forEach(function(d){data.set(d.code, +d.value);})

            var range_low = 0,
                range_high= d3.max(topo.features, function(d){return data.get(d.id);});
                //console.log(range_low);
                //console.log(range_high);
            var color = d3.scaleLinear()
            .range([lowColor, highColor])
            .domain([range_low,range_high])
            .interpolate(d3.interpolateLab);

            // Draw the map
            svg.append("g")
                .attr("class", "countries")
                .selectAll("path")
                .data(topo.features)
                .enter().append("path")
                    .attr("id", function(d){ d.value = data.get(d.id) || 0; return d.value;})
                    .attr("d", path)
                    .style("fill", function(d) {
                      if(typeof data.get(d.id) === "undefined"){
                        return("#f2f4f5"); //#f7f9fa color like
                      }else{
                        return color(d.value)
                      }
                       }) //add a return color for no data
                      .on("mouseover", tip.show)
                      .on("mouseleave", tip.hide)
                      .on("mouseout", tip.hide)
                      .on('click',function(d){Array.prototype.forEach.call(document.querySelectorAll('.d3-tip'), (t) => t.parentNode.removeChild(t)); $scope.graphDataGenerator($scope.hits,$scope.visualIndex,d.id)});





            //title
            svg.append("text")
              .attr("x", (width / 2))
              .attr("y", 15)
              .attr("text-anchor", "middle")
              .style("font-size", "16px")
              .text("Geographic distribution of searched variant");

                    // add a legend
                		var w = 140, h = 150;

                		var key = svg
                			.append("svg")
                			.attr("width", w)
                			.attr("height", h)
                			.attr("class", "legend");

                		var legend = key.append("defs")
                			.append("svg:linearGradient")
                			.attr("id", "gradient")
                			.attr("x1", "100%")
                			.attr("y1", "0%")
                			.attr("x2", "100%")
                			.attr("y2", "100%")
                			.attr("spreadMethod", "pad");

                		legend.append("stop")
                			.attr("offset", "0%")
                			.attr("stop-color", highColor)
                			.attr("stop-opacity", 1);

                		legend.append("stop")
                			.attr("offset", "100%")
                			.attr("stop-color", lowColor)
                			.attr("stop-opacity", 1);

                		key.append("rect")
                			.attr("width", w - 110)
                			.attr("height", h)
                			.style("fill", "url(#gradient)")
                			.attr("transform", "translate(0,10)");

                		var y = d3.scaleLinear()
                			.range([h, 0])
                			.domain([range_low, range_high]);

                		var yAxis = d3.axisRight(y);

                		key.append("g")
                			.attr("class", "y axis")
                			.attr("transform", "translate(40,10)")
                			.call(yAxis)
        }).catch(function(error) {
          console.log(error);
        });
      }
      var generateHistogram = function(sampleData){

        //console.log(sampleData.sort(function(a,b){return a.date > b.date;}));
        d3.select("body").select('#histogram').selectAll("svg").remove();
        sampleData = sampleData.sort((a,b) => a.date.localeCompare(b.date));
        console.log(sampleData)
        console.log(d3.max(sampleData, d => d.value))
        var width = parseInt(d3.select('#histogram').style('width'), 10);
        var height = parseInt(d3.select('#histogram').style('height'), 10);
        var margin  = {top: 20, right: 20, bottom: 30, left: 50};
        //var aspect = width / height;

        var svg = d3.select("body").select('#histogram')
        .append("svg")
        .attr("width", width - 50 )
        .attr("height", height);


        x = d3.scaleBand().rangeRound([0, width - 100]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height-50, 20]),
        g = svg.append("g")
        .attr("transform", "translate(50,0)");

        x.domain(sampleData.map(d => d.date));
        y.domain([0, 100]);//d3.max(sampleData, d => d.value)
        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-12, 0])
        .html(function(d) {
          //console.log(d);
          return  d.breakup+" ("+d.value+"%)";
        })
        svg.call(tip);

        g.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", "translate(0,350)")
        .call(d3.axisBottom(x));

        g.append("g")
        .attr("class", "axis axis-y")
        .call(d3.axisLeft(y).ticks(5));

        g.selectAll(".bar")
        .data(sampleData)
        .enter().append("rect")
        .attr("class", "transparentBar")
        .attr("x", d => x(d.date))
        .attr("y", 345)
        .attr("width", x.bandwidth())
        .attr("height", 5)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

        g.selectAll(".bar")
        .data(sampleData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.date))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height -50 - y(d.value))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

        //title
        g.append("text")
          .data(sampleData)
          .attr("x", (width / 3))
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text(function(d){ console.log(d); if(d.location == "all"){return "Frequency over time for searched variant "} else{ return "Frequency over time for "+ d.location} });




      }

});
