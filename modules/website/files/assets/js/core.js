var covidBeacon = angular.module('covidBeacon', ['ngMaterial','ngRoute'])
  .config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
      $locationProvider.hashPrefix('');
      $routeProvider.when('/home/', {
          templateUrl: 'views/table.html',
          controller: 'beacon',
      });
      $routeProvider.when('/contact/', {
          templateUrl: 'views/contact.html',
      });
      $routeProvider.otherwise({
      templateUrl: 'views/table.html',
          controller: 'beacon'
      });
}]);


covidBeacon.controller('beacon', function( $scope, $http, $q) {

    var rootUrl = window.beacon_api_url;
    $scope.sPos, $scope.ePos, $scope.VarType;
    $scope.ref = $scope.alt ="";
    $scope.isVisible = false;
    $scope.hits = $scope.warning = $scope.sMin = $scope.sMax = $scope.eMin = $scope.eMax = null;
    var queryData = "";
    $scope.rootQuery = [];
    function successCallback(response) {
      return response.data.datasets
    }
    $scope.rootQuery = $http.get(rootUrl).then(successCallback);


    $scope.ShowHide = function(){
            $scope.isVisible = !$scope.isVisible;
    }

    $scope.query = function(){
      var url = rootUrl+ "/query";
      //do validation and throw error. Need to change assembly to  hCoV-19 later.
      if( $scope.sMin != null || $scope.sMax != null || $scope.eMin != null || $scope.eMax != null){
        $scope.sPos = null;
        $scope.ePos = null;
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "startMin":$scope.sMin,"startMax":$scope.sMax,"endMin":$scope.eMin,"endMax":$scope.eMax,"variantType":$scope.VarType};
      }else{
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "start":$scope.sPos,"end":$scope.ePos,"variantType":$scope.VarType};
      }

      $http({method: 'GET', url: url,params:queryData}).then(function successCallback(resp) {
        var hits = resp.data;
        console.log(hits);
        $scope.hits = [];
        if( hits.exists == true){
          $q.all([$scope.rootQuery]).then(function(data){
            var DatArray = data[0];
            angular.forEach(hits.datasetAlleleResponses, function(row){
              var filterObj = DatArray.filter(function(e) {
                return e.id == row.datasetId;
              });
              row['totalSampleCount'] = filterObj[0].sampleCount;
              row['description']= filterObj[0].description;
              row['name']= filterObj[0].name
              this.push(row);
            }, $scope.hits);
            console.log($scope.hits);
          });

        }else if(hits.error == true){
          $scope.warning = hits.error.errorMessage;
          $scope.hits = null;
        }else{
          $scope.hits = null;
          $scope.warning = "No hits matching the search criteria";
          console.log($scope.warning );
        }


      }, function errorCallback(resp) {
          console.log("Error: " + JSON.stringify(resp));
      });


    }

});
