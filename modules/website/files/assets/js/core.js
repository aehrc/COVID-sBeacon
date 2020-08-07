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
  //Data collected from https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;alpha3Code
  var geoData = [{"name":"Afghanistan","alpha2Code":"AF","alpha3Code":"AFG"},{"name":"Åland Islands","alpha2Code":"AX","alpha3Code":"ALA"},{"name":"Albania","alpha2Code":"AL","alpha3Code":"ALB"},{"name":"Algeria","alpha2Code":"DZ","alpha3Code":"DZA"},{"name":"American Samoa","alpha2Code":"AS","alpha3Code":"ASM"},{"name":"Andorra","alpha2Code":"AD","alpha3Code":"AND"},{"name":"Angola","alpha2Code":"AO","alpha3Code":"AGO"},{"name":"Anguilla","alpha2Code":"AI","alpha3Code":"AIA"},{"name":"Antarctica","alpha2Code":"AQ","alpha3Code":"ATA"},{"name":"Antigua and Barbuda","alpha2Code":"AG","alpha3Code":"ATG"},{"name":"Argentina","alpha2Code":"AR","alpha3Code":"ARG"},{"name":"Armenia","alpha2Code":"AM","alpha3Code":"ARM"},{"name":"Aruba","alpha2Code":"AW","alpha3Code":"ABW"},{"name":"Australia","alpha2Code":"AU","alpha3Code":"AUS"},{"name":"Austria","alpha2Code":"AT","alpha3Code":"AUT"},{"name":"Azerbaijan","alpha2Code":"AZ","alpha3Code":"AZE"},{"name":"Bahamas","alpha2Code":"BS","alpha3Code":"BHS"},{"name":"Bahrain","alpha2Code":"BH","alpha3Code":"BHR"},{"name":"Bangladesh","alpha2Code":"BD","alpha3Code":"BGD"},{"name":"Barbados","alpha2Code":"BB","alpha3Code":"BRB"},{"name":"Belarus","alpha2Code":"BY","alpha3Code":"BLR"},{"name":"Belgium","alpha2Code":"BE","alpha3Code":"BEL"},{"name":"Belize","alpha2Code":"BZ","alpha3Code":"BLZ"},{"name":"Benin","alpha2Code":"BJ","alpha3Code":"BEN"},{"name":"Bermuda","alpha2Code":"BM","alpha3Code":"BMU"},{"name":"Bhutan","alpha2Code":"BT","alpha3Code":"BTN"},{"name":"Bolivia (Plurinational State of)","alpha2Code":"BO","alpha3Code":"BOL"},{"name":"Bonaire, Sint Eustatius and Saba","alpha2Code":"BQ","alpha3Code":"BES"},{"name":"Bosnia and Herzegovina","alpha2Code":"BA","alpha3Code":"BIH"},{"name":"Botswana","alpha2Code":"BW","alpha3Code":"BWA"},{"name":"Bouvet Island","alpha2Code":"BV","alpha3Code":"BVT"},{"name":"Brazil","alpha2Code":"BR","alpha3Code":"BRA"},{"name":"British Indian Ocean Territory","alpha2Code":"IO","alpha3Code":"IOT"},{"name":"United States Minor Outlying Islands","alpha2Code":"UM","alpha3Code":"UMI"},{"name":"Virgin Islands (British)","alpha2Code":"VG","alpha3Code":"VGB"},{"name":"Virgin Islands (U.S.)","alpha2Code":"VI","alpha3Code":"VIR"},{"name":"Brunei Darussalam","alpha2Code":"BN","alpha3Code":"BRN"},{"name":"Bulgaria","alpha2Code":"BG","alpha3Code":"BGR"},{"name":"Burkina Faso","alpha2Code":"BF","alpha3Code":"BFA"},{"name":"Burundi","alpha2Code":"BI","alpha3Code":"BDI"},{"name":"Cambodia","alpha2Code":"KH","alpha3Code":"KHM"},{"name":"Cameroon","alpha2Code":"CM","alpha3Code":"CMR"},{"name":"Canada","alpha2Code":"CA","alpha3Code":"CAN"},{"name":"Cabo Verde","alpha2Code":"CV","alpha3Code":"CPV"},{"name":"Cayman Islands","alpha2Code":"KY","alpha3Code":"CYM"},{"name":"Central African Republic","alpha2Code":"CF","alpha3Code":"CAF"},{"name":"Chad","alpha2Code":"TD","alpha3Code":"TCD"},{"name":"Chile","alpha2Code":"CL","alpha3Code":"CHL"},{"name":"China","alpha2Code":"CN","alpha3Code":"CHN"},{"name":"Christmas Island","alpha2Code":"CX","alpha3Code":"CXR"},{"name":"Cocos (Keeling) Islands","alpha2Code":"CC","alpha3Code":"CCK"},{"name":"Colombia","alpha2Code":"CO","alpha3Code":"COL"},{"name":"Comoros","alpha2Code":"KM","alpha3Code":"COM"},{"name":"Congo","alpha2Code":"CG","alpha3Code":"COG"},{"name":"Congo (Democratic Republic of the)","alpha2Code":"CD","alpha3Code":"COD"},{"name":"Cook Islands","alpha2Code":"CK","alpha3Code":"COK"},{"name":"Costa Rica","alpha2Code":"CR","alpha3Code":"CRI"},{"name":"Croatia","alpha2Code":"HR","alpha3Code":"HRV"},{"name":"Cuba","alpha2Code":"CU","alpha3Code":"CUB"},{"name":"Curaçao","alpha2Code":"CW","alpha3Code":"CUW"},{"name":"Cyprus","alpha2Code":"CY","alpha3Code":"CYP"},{"name":"Czech Republic","alpha2Code":"CZ","alpha3Code":"CZE"},{"name":"Denmark","alpha2Code":"DK","alpha3Code":"DNK"},{"name":"Djibouti","alpha2Code":"DJ","alpha3Code":"DJI"},{"name":"Dominica","alpha2Code":"DM","alpha3Code":"DMA"},{"name":"Dominican Republic","alpha2Code":"DO","alpha3Code":"DOM"},{"name":"Ecuador","alpha2Code":"EC","alpha3Code":"ECU"},{"name":"Egypt","alpha2Code":"EG","alpha3Code":"EGY"},{"name":"El Salvador","alpha2Code":"SV","alpha3Code":"SLV"},{"name":"Equatorial Guinea","alpha2Code":"GQ","alpha3Code":"GNQ"},{"name":"Eritrea","alpha2Code":"ER","alpha3Code":"ERI"},{"name":"Estonia","alpha2Code":"EE","alpha3Code":"EST"},{"name":"Ethiopia","alpha2Code":"ET","alpha3Code":"ETH"},{"name":"Falkland Islands (Malvinas)","alpha2Code":"FK","alpha3Code":"FLK"},{"name":"Faroe Islands","alpha2Code":"FO","alpha3Code":"FRO"},{"name":"Fiji","alpha2Code":"FJ","alpha3Code":"FJI"},{"name":"Finland","alpha2Code":"FI","alpha3Code":"FIN"},{"name":"France","alpha2Code":"FR","alpha3Code":"FRA"},{"name":"French Guiana","alpha2Code":"GF","alpha3Code":"GUF"},{"name":"French Polynesia","alpha2Code":"PF","alpha3Code":"PYF"},{"name":"French Southern Territories","alpha2Code":"TF","alpha3Code":"ATF"},{"name":"Gabon","alpha2Code":"GA","alpha3Code":"GAB"},{"name":"Gambia","alpha2Code":"GM","alpha3Code":"GMB"},{"name":"Georgia","alpha2Code":"GE","alpha3Code":"GEO"},{"name":"Germany","alpha2Code":"DE","alpha3Code":"DEU"},{"name":"Ghana","alpha2Code":"GH","alpha3Code":"GHA"},{"name":"Gibraltar","alpha2Code":"GI","alpha3Code":"GIB"},{"name":"Greece","alpha2Code":"GR","alpha3Code":"GRC"},{"name":"Greenland","alpha2Code":"GL","alpha3Code":"GRL"},{"name":"Grenada","alpha2Code":"GD","alpha3Code":"GRD"},{"name":"Guadeloupe","alpha2Code":"GP","alpha3Code":"GLP"},{"name":"Guam","alpha2Code":"GU","alpha3Code":"GUM"},{"name":"Guatemala","alpha2Code":"GT","alpha3Code":"GTM"},{"name":"Guernsey","alpha2Code":"GG","alpha3Code":"GGY"},{"name":"Guinea","alpha2Code":"GN","alpha3Code":"GIN"},{"name":"Guinea-Bissau","alpha2Code":"GW","alpha3Code":"GNB"},{"name":"Guyana","alpha2Code":"GY","alpha3Code":"GUY"},{"name":"Haiti","alpha2Code":"HT","alpha3Code":"HTI"},{"name":"Heard Island and McDonald Islands","alpha2Code":"HM","alpha3Code":"HMD"},{"name":"Holy See","alpha2Code":"VA","alpha3Code":"VAT"},{"name":"Honduras","alpha2Code":"HN","alpha3Code":"HND"},{"name":"Hong Kong","alpha2Code":"HK","alpha3Code":"HKG"},{"name":"Hungary","alpha2Code":"HU","alpha3Code":"HUN"},{"name":"Iceland","alpha2Code":"IS","alpha3Code":"ISL"},{"name":"India","alpha2Code":"IN","alpha3Code":"IND"},{"name":"Indonesia","alpha2Code":"ID","alpha3Code":"IDN"},{"name":"Côte d'Ivoire","alpha2Code":"CI","alpha3Code":"CIV"},{"name":"Iran (Islamic Republic of)","alpha2Code":"IR","alpha3Code":"IRN"},{"name":"Iraq","alpha2Code":"IQ","alpha3Code":"IRQ"},{"name":"Ireland","alpha2Code":"IE","alpha3Code":"IRL"},{"name":"Isle of Man","alpha2Code":"IM","alpha3Code":"IMN"},{"name":"Israel","alpha2Code":"IL","alpha3Code":"ISR"},{"name":"Italy","alpha2Code":"IT","alpha3Code":"ITA"},{"name":"Jamaica","alpha2Code":"JM","alpha3Code":"JAM"},{"name":"Japan","alpha2Code":"JP","alpha3Code":"JPN"},{"name":"Jersey","alpha2Code":"JE","alpha3Code":"JEY"},{"name":"Jordan","alpha2Code":"JO","alpha3Code":"JOR"},{"name":"Kazakhstan","alpha2Code":"KZ","alpha3Code":"KAZ"},{"name":"Kenya","alpha2Code":"KE","alpha3Code":"KEN"},{"name":"Kiribati","alpha2Code":"KI","alpha3Code":"KIR"},{"name":"Kuwait","alpha2Code":"KW","alpha3Code":"KWT"},{"name":"Kyrgyzstan","alpha2Code":"KG","alpha3Code":"KGZ"},{"name":"Lao People's Democratic Republic","alpha2Code":"LA","alpha3Code":"LAO"},{"name":"Latvia","alpha2Code":"LV","alpha3Code":"LVA"},{"name":"Lebanon","alpha2Code":"LB","alpha3Code":"LBN"},{"name":"Lesotho","alpha2Code":"LS","alpha3Code":"LSO"},{"name":"Liberia","alpha2Code":"LR","alpha3Code":"LBR"},{"name":"Libya","alpha2Code":"LY","alpha3Code":"LBY"},{"name":"Liechtenstein","alpha2Code":"LI","alpha3Code":"LIE"},{"name":"Lithuania","alpha2Code":"LT","alpha3Code":"LTU"},{"name":"Luxembourg","alpha2Code":"LU","alpha3Code":"LUX"},{"name":"Macao","alpha2Code":"MO","alpha3Code":"MAC"},{"name":"Macedonia (the former Yugoslav Republic of)","alpha2Code":"MK","alpha3Code":"MKD"},{"name":"Madagascar","alpha2Code":"MG","alpha3Code":"MDG"},{"name":"Malawi","alpha2Code":"MW","alpha3Code":"MWI"},{"name":"Malaysia","alpha2Code":"MY","alpha3Code":"MYS"},{"name":"Maldives","alpha2Code":"MV","alpha3Code":"MDV"},{"name":"Mali","alpha2Code":"ML","alpha3Code":"MLI"},{"name":"Malta","alpha2Code":"MT","alpha3Code":"MLT"},{"name":"Marshall Islands","alpha2Code":"MH","alpha3Code":"MHL"},{"name":"Martinique","alpha2Code":"MQ","alpha3Code":"MTQ"},{"name":"Mauritania","alpha2Code":"MR","alpha3Code":"MRT"},{"name":"Mauritius","alpha2Code":"MU","alpha3Code":"MUS"},{"name":"Mayotte","alpha2Code":"YT","alpha3Code":"MYT"},{"name":"Mexico","alpha2Code":"MX","alpha3Code":"MEX"},{"name":"Micronesia (Federated States of)","alpha2Code":"FM","alpha3Code":"FSM"},{"name":"Moldova (Republic of)","alpha2Code":"MD","alpha3Code":"MDA"},{"name":"Monaco","alpha2Code":"MC","alpha3Code":"MCO"},{"name":"Mongolia","alpha2Code":"MN","alpha3Code":"MNG"},{"name":"Montenegro","alpha2Code":"ME","alpha3Code":"MNE"},{"name":"Montserrat","alpha2Code":"MS","alpha3Code":"MSR"},{"name":"Morocco","alpha2Code":"MA","alpha3Code":"MAR"},{"name":"Mozambique","alpha2Code":"MZ","alpha3Code":"MOZ"},{"name":"Myanmar","alpha2Code":"MM","alpha3Code":"MMR"},{"name":"Namibia","alpha2Code":"NA","alpha3Code":"NAM"},{"name":"Nauru","alpha2Code":"NR","alpha3Code":"NRU"},{"name":"Nepal","alpha2Code":"NP","alpha3Code":"NPL"},{"name":"Netherlands","alpha2Code":"NL","alpha3Code":"NLD"},{"name":"New Caledonia","alpha2Code":"NC","alpha3Code":"NCL"},{"name":"New Zealand","alpha2Code":"NZ","alpha3Code":"NZL"},{"name":"Nicaragua","alpha2Code":"NI","alpha3Code":"NIC"},{"name":"Niger","alpha2Code":"NE","alpha3Code":"NER"},{"name":"Nigeria","alpha2Code":"NG","alpha3Code":"NGA"},{"name":"Niue","alpha2Code":"NU","alpha3Code":"NIU"},{"name":"Norfolk Island","alpha2Code":"NF","alpha3Code":"NFK"},{"name":"Korea (Democratic People's Republic of)","alpha2Code":"KP","alpha3Code":"PRK"},{"name":"Northern Mariana Islands","alpha2Code":"MP","alpha3Code":"MNP"},{"name":"Norway","alpha2Code":"NO","alpha3Code":"NOR"},{"name":"Oman","alpha2Code":"OM","alpha3Code":"OMN"},{"name":"Pakistan","alpha2Code":"PK","alpha3Code":"PAK"},{"name":"Palau","alpha2Code":"PW","alpha3Code":"PLW"},{"name":"Palestine, State of","alpha2Code":"PS","alpha3Code":"PSE"},{"name":"Panama","alpha2Code":"PA","alpha3Code":"PAN"},{"name":"Papua New Guinea","alpha2Code":"PG","alpha3Code":"PNG"},{"name":"Paraguay","alpha2Code":"PY","alpha3Code":"PRY"},{"name":"Peru","alpha2Code":"PE","alpha3Code":"PER"},{"name":"Philippines","alpha2Code":"PH","alpha3Code":"PHL"},{"name":"Pitcairn","alpha2Code":"PN","alpha3Code":"PCN"},{"name":"Poland","alpha2Code":"PL","alpha3Code":"POL"},{"name":"Portugal","alpha2Code":"PT","alpha3Code":"PRT"},{"name":"Puerto Rico","alpha2Code":"PR","alpha3Code":"PRI"},{"name":"Qatar","alpha2Code":"QA","alpha3Code":"QAT"},{"name":"Republic of Kosovo","alpha2Code":"XK","alpha3Code":"KOS"},{"name":"Réunion","alpha2Code":"RE","alpha3Code":"REU"},{"name":"Romania","alpha2Code":"RO","alpha3Code":"ROU"},{"name":"Russian Federation","alpha2Code":"RU","alpha3Code":"RUS"},{"name":"Rwanda","alpha2Code":"RW","alpha3Code":"RWA"},{"name":"Saint Barthélemy","alpha2Code":"BL","alpha3Code":"BLM"},{"name":"Saint Helena, Ascension and Tristan da Cunha","alpha2Code":"SH","alpha3Code":"SHN"},{"name":"Saint Kitts and Nevis","alpha2Code":"KN","alpha3Code":"KNA"},{"name":"Saint Lucia","alpha2Code":"LC","alpha3Code":"LCA"},{"name":"Saint Martin (French part)","alpha2Code":"MF","alpha3Code":"MAF"},{"name":"Saint Pierre and Miquelon","alpha2Code":"PM","alpha3Code":"SPM"},{"name":"Saint Vincent and the Grenadines","alpha2Code":"VC","alpha3Code":"VCT"},{"name":"Samoa","alpha2Code":"WS","alpha3Code":"WSM"},{"name":"San Marino","alpha2Code":"SM","alpha3Code":"SMR"},{"name":"Sao Tome and Principe","alpha2Code":"ST","alpha3Code":"STP"},{"name":"Saudi Arabia","alpha2Code":"SA","alpha3Code":"SAU"},{"name":"Senegal","alpha2Code":"SN","alpha3Code":"SEN"},{"name":"Serbia","alpha2Code":"RS","alpha3Code":"SRB"},{"name":"Seychelles","alpha2Code":"SC","alpha3Code":"SYC"},{"name":"Sierra Leone","alpha2Code":"SL","alpha3Code":"SLE"},{"name":"Singapore","alpha2Code":"SG","alpha3Code":"SGP"},{"name":"Sint Maarten (Dutch part)","alpha2Code":"SX","alpha3Code":"SXM"},{"name":"Slovakia","alpha2Code":"SK","alpha3Code":"SVK"},{"name":"Slovenia","alpha2Code":"SI","alpha3Code":"SVN"},{"name":"Solomon Islands","alpha2Code":"SB","alpha3Code":"SLB"},{"name":"Somalia","alpha2Code":"SO","alpha3Code":"SOM"},{"name":"South Africa","alpha2Code":"ZA","alpha3Code":"ZAF"},{"name":"South Georgia and the South Sandwich Islands","alpha2Code":"GS","alpha3Code":"SGS"},{"name":"Korea (Republic of)","alpha2Code":"KR","alpha3Code":"KOR"},{"name":"South Sudan","alpha2Code":"SS","alpha3Code":"SSD"},{"name":"Spain","alpha2Code":"ES","alpha3Code":"ESP"},{"name":"Sri Lanka","alpha2Code":"LK","alpha3Code":"LKA"},{"name":"Sudan","alpha2Code":"SD","alpha3Code":"SDN"},{"name":"Suriname","alpha2Code":"SR","alpha3Code":"SUR"},{"name":"Svalbard and Jan Mayen","alpha2Code":"SJ","alpha3Code":"SJM"},{"name":"Swaziland","alpha2Code":"SZ","alpha3Code":"SWZ"},{"name":"Sweden","alpha2Code":"SE","alpha3Code":"SWE"},{"name":"Switzerland","alpha2Code":"CH","alpha3Code":"CHE"},{"name":"Syrian Arab Republic","alpha2Code":"SY","alpha3Code":"SYR"},{"name":"Taiwan","alpha2Code":"TW","alpha3Code":"TWN"},{"name":"Tajikistan","alpha2Code":"TJ","alpha3Code":"TJK"},{"name":"Tanzania, United Republic of","alpha2Code":"TZ","alpha3Code":"TZA"},{"name":"Thailand","alpha2Code":"TH","alpha3Code":"THA"},{"name":"Timor-Leste","alpha2Code":"TL","alpha3Code":"TLS"},{"name":"Togo","alpha2Code":"TG","alpha3Code":"TGO"},{"name":"Tokelau","alpha2Code":"TK","alpha3Code":"TKL"},{"name":"Tonga","alpha2Code":"TO","alpha3Code":"TON"},{"name":"Trinidad and Tobago","alpha2Code":"TT","alpha3Code":"TTO"},{"name":"Tunisia","alpha2Code":"TN","alpha3Code":"TUN"},{"name":"Turkey","alpha2Code":"TR","alpha3Code":"TUR"},{"name":"Turkmenistan","alpha2Code":"TM","alpha3Code":"TKM"},{"name":"Turks and Caicos Islands","alpha2Code":"TC","alpha3Code":"TCA"},{"name":"Tuvalu","alpha2Code":"TV","alpha3Code":"TUV"},{"name":"Uganda","alpha2Code":"UG","alpha3Code":"UGA"},{"name":"Ukraine","alpha2Code":"UA","alpha3Code":"UKR"},{"name":"United Arab Emirates","alpha2Code":"AE","alpha3Code":"ARE"},{"name":"United Kingdom of Great Britain and Northern Ireland","alpha2Code":"GB","alpha3Code":"GBR"},{"name":"United States of America","alpha2Code":"US","alpha3Code":"USA"},{"name":"Uruguay","alpha2Code":"UY","alpha3Code":"URY"},{"name":"Uzbekistan","alpha2Code":"UZ","alpha3Code":"UZB"},{"name":"Vanuatu","alpha2Code":"VU","alpha3Code":"VUT"},{"name":"Venezuela (Bolivarian Republic of)","alpha2Code":"VE","alpha3Code":"VEN"},{"name":"Viet Nam","alpha2Code":"VN","alpha3Code":"VNM"},{"name":"Wallis and Futuna","alpha2Code":"WF","alpha3Code":"WLF"},{"name":"Western Sahara","alpha2Code":"EH","alpha3Code":"ESH"},{"name":"Yemen","alpha2Code":"YE","alpha3Code":"YEM"},{"name":"Zambia","alpha2Code":"ZM","alpha3Code":"ZMB"},{"name":"Zimbabwe","alpha2Code":"ZW","alpha3Code":"ZWE"}];


    var rootUrl = window.beacon_api_url;
    var url = rootUrl+ "/query";
    $scope.sPos, $scope.VarType,$scope.totalEntries;
    $scope.ref = $scope.alt ="";
    $scope.isVisible = $scope.loading = $scope.sortReverse  =  false;
    $scope.subSortReverse = true;
    $scope.orderByField = 'name';
    $scope.inputText = $scope.hits = $scope.warning = $scope.sMin = $scope.sMax = $scope.eMin = $scope.eMax = null;
    $scope.sortType     = 'name';
    $scope.subSortType     = 'frequency';
    $scope.pages = [5 , 10, 25, 50, 100];
    $scope.usersPerPage = 25;
    $scope.currentPage = 1;

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
    $scope.refresh = function(){
      location.reload(false);
    }
    $scope.search = function(searches){
      //console.log(searches);
      if(searches == 'D614G'){
        /*$scope.sPos = 23403;
        $scope.ref = "A";
        $scope.alt = "G";*/
        $scope.inputText= "23403 A>G";
        $scope.query();
      }
    }

    //$scope.pageChanged = function(id){
      //console.log(id);

      //queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "startMin":$scope.sMin-1,"startMax":$scope.sMax-1,"endMin":$scope.eMin-1,"endMax":$scope.eMax-1,"variantType":$scope.VarType};
      //getData(url,queryData)
    //}

    $scope.query = function(){
      $scope.loading = true;

      //do validation and throw error. Need to change assembly to  hCoV-19 later.
      if( $scope.sMin != null || $scope.sMax != null || $scope.eMin != null || $scope.eMax != null){
        $scope.inputText= null;
          if($scope.VarType != null ){
            $scope.alt = null;
            queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(), "startMin":$scope.sMin-1,"startMax":$scope.sMax-1,"endMin":$scope.eMin-1,"endMax":$scope.eMax-1,"variantType":$scope.VarType.toUpperCase(),"sampleFields":["SampleCollectionDate","Location"]};
          }
          if($scope.alt != null ){
            $scope.VarType = null;
            queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "startMin":$scope.sMin-1,"startMax":$scope.sMax-1,"endMin":$scope.eMin-1,"endMax":$scope.eMax-1,"sampleFields":["SampleCollectionDate","Location"]};
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
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "start":$scope.sPos-1,"variantType":$scope.VarType,"sampleFields":["SampleCollectionDate","Location"]};

      }
      console.log(queryData);

      getData(url,queryData)



    }
    var getData = function(url,queryData){
      //console.log(url,queryData);
      $http({method: 'GET', url: url,params:queryData}).then(function successCallback(resp) {
        var hits = resp.data;
        //console.log(hits);
        $scope.hits = [];
        if( hits.exists == true){
          $scope.warning = null;
          $scope.hits =hits.datasetAlleleResponses;
          console.log($scope.hits);
          $scope.loading = false;
          var sampleDetails = $scope.hits[1].info.sampleDetails;
          var locationDetails = $scope.hits[1].info.locationCounts;
          var sampleData = [];
          var hash = {};
          for (var i = 0; i < sampleDetails.length; i++) {
            var val = sampleDetails[i][1];
            if (typeof hash[val] !== "undefined") {
              hash[val]++;
            }else{
              hash[val] = 1;
            }
          }
          console.log(hash);
          console.log(Object.keys(locationDetails[0]));
          for(var i = 0; i < locationDetails.length; i++) {
            //console.log(Object.keys(locationDetails[i]));
            let key = Object.keys(locationDetails[i]);
            var val = parseFloat((hash[key]/locationDetails[i][key])*100).toFixed(2);
            hash[key]=val;
          }
          console.log(hash);

          for (var key in hash) {
            for(var i = 0; i < geoData.length; i++) {
              if(geoData[i]["alpha3Code"] == key){

                sampleData.push({"code": key, "value": hash[key], "title": geoData[i]["name"]});
                continue;
              }
            }
          }
          generateMap(sampleData,"chartNGDC",null,[' 0', ' 1% - 5%', ' 6% - 10%', '11% - 25%', '26% - 50%', '51% - 75%', '> 76%'],[1, 6, 11, 26, 51, 76])
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


      var generateMap = function(sampleData, divID, subDivID, labels, domain){
        console.log(labels);
        d3.select(".legendThreshold").remove();

        var width = 800 ,
            height = 400 ;
        var lowColor = '#f2f4f5'
        var highColor = '#477fb6'
        if(subDivID == null){
          d3.select('#'+divID).selectAll("svg").remove();

          var svg = d3.select("body").select('#'+divID)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

        }else{
          d3.select('#'+divID).select('#'+subDivID).selectAll("svg").remove();
          var svg = d3.select("body").select('#'+divID).select('#'+subDivID)
                  .append("svg")
                  .attr("width", width )
                  .attr("height", height );
        }


        // Map and projection

        var projection = d3.geoNaturalEarth()
            .scale(width / 2 / Math.PI)
            .translate([width / 2, height / 2])
        var path = d3.geoPath()
            .projection(projection);

        // Data and color scale
        var data = d3.map();




        // Load external data and boot
        d3.queue()
            .defer(d3.json, "assets/geojson/world.geojson")
            .await(ready);

        sampleData.forEach(function(d){
        data.set(d.code, +d.value) // (first refers to county code, second refers to employment value)
            })



        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function(d) {
          return d.properties.name + ": " + d.value+"%";
        })
        svg.call(tip);

        function ready(error, topo) {
            console.log(topo)
            if (error) throw error;
            var range_low = 0,
                range_high= d3.max(topo.features, function(d){return data.get(d.id);});
                console.log(range_low);
                console.log(range_high);
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
                      return color(d.value) })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);

                    // add a legend
                		var w = 140, h = 200;

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
                			.attr("transform", "translate(41,10)")
                			.call(yAxis)
        }


      }

});
