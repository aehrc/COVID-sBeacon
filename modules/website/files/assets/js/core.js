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


covidBeacon.controller('beacon', function($scope, $http) {

    $scope.sPos;
    $scope.ePos;
    $scope.VarType;
    $scope.ref = $scope.alt ="";
    $scope.isVisible = false;
    $scope.hits = $scope.warning = $scope.sMin = $scope.sMax = $scope.eMin = $scope.eMax = null;
    var queryData = "";


    $scope.ShowHide = function(){
          console.log("clicker");
            $scope.isVisible = !$scope.isVisible;
    }
    $scope.query = function(){
      //do validation and throw error. Need to change assembly to  hCoV-19 later.
      if( $scope.sMin != null || $scope.sMax != null || $scope.eMin != null || $scope.eMax != null){
        $scope.sPos = null;
        $scope.ePos = null;
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref,"alternateBases":$scope.alt, "startMin":$scope.sMin,"startMax":$scope.sMax,"endMin":$scope.eMin,"endMax":$scope.eMax,"variantType":$scope.VarType};
      }else{
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref,"alternateBases":$scope.alt, "start":$scope.sPos,"end":$scope.ePos,"variantType":$scope.VarType};
      }
      var url = window.beacon_api_url + "/query";
      $http({method: 'GET', url: url,params:queryData}).then(function successCallback(resp) {
        var hits = resp.data;
        console.log(hits);
        if( hits.exists == true){
          $scope.hits = hits.datasetAlleleResponses;
          $scope.warning =null;
          console.log($scope.hits);
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
    /*$http.get('http://rest-service.guides.spring.io/greeting').
        then(function(response) {
            $scope.greeting = response.data;
            console.log($scope.greeting);
        });*/
});
