var covidBeacon = angular.module('covidBeacon', ['ngMaterial','ngRoute'])
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

    var rootUrl = window.beacon_api_url;
    $scope.sPos, $scope.VarType;
    $scope.ref = $scope.alt ="";
    $scope.isVisible = $scope.loading = $scope.sortReverse = $scope.subSortReverse =  false;
    $scope.orderByField = 'name';
    $scope.inputText = $scope.hits = $scope.warning = $scope.sMin = $scope.sMax = $scope.eMin = $scope.eMax = null;
    $scope.sortType     = 'name';
    $scope.subSortType     = 'Variant';
    var queryData = "";
    $scope.rootQuery = [];
    function successCallback(response) {
      return response.data.datasets
    }

    $scope.rootQuery = $http.get(rootUrl).then(successCallback);
    console.log($scope.rootQuery);


    $scope.ShowHide = function(){
            $scope.isVisible = !$scope.isVisible;
    }
    $scope.refresh = function(){
      location.reload(false);
    }
    $scope.search = function(searches){
      console.log(searches);
      if(searches == 'D614G'){
        /*$scope.sPos = 23403;
        $scope.ref = "A";
        $scope.alt = "G";*/
        $scope.inputText= "23403A>G";
        $scope.query();
      }
    }

    $scope.query = function(){
      $scope.loading = true;
      var url = rootUrl+ "/query";

      if( $scope.inputText != null){
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


        console.log($scope.sPos);
        console.log($scope.ref);
        console.log($scope.alt);
      }




      //do validation and throw error. Need to change assembly to  hCoV-19 later.
      if( $scope.sMin != null || $scope.sMax != null || $scope.eMin != null || $scope.eMax != null){
        $scope.inputText= null;
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "startMin":$scope.sMin-1,"startMax":$scope.sMax-1,"endMin":$scope.eMin-1,"endMax":$scope.eMax-1,"variantType":$scope.VarType};
      }else{
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "start":$scope.sPos-1,"variantType":$scope.VarType};
      }
      console.log(url,queryData);
      $http({method: 'GET', url: url,params:queryData}).then(function successCallback(resp) {
        var hits = resp.data;
        //console.log(hits);
        $scope.hits = [];
        if( hits.exists == true){
          $scope.warning = null;
          $scope.hits =hits.datasetAlleleResponses;
          /*$q.all([$scope.rootQuery]).then(function(data){
            var DatArray = data[0];
            angular.forEach(hits.datasetAlleleResponses, function(row){
              var filterObj = DatArray.filter(function(e) {
                return e.id == row.datasetId;
              });
              row['totalSampleCount'] = filterObj[0].sampleCount;
              row['description']= filterObj[0].description;
              row['name']= filterObj[0].name;
              this.push(row);
            }, $scope.hits);*/

            console.log($scope.hits);
            $scope.loading = false;
          //});

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

});
