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

    $scope.sPos ;
    $scope.ePos ;
    $scope.ref = "";
    $scope.alt = "";
    $scope.isVisible = false;
    $scope.hits = "";
    $scope.warning ="";

    $scope.ShowHide = function(){
          console.log("clicker");
            $scope.isVisible = !$scope.isVisible;
    }
    $scope.query = function(){
      //do validation and throw error. Need to change assembly to  hCoV-19 later.
      var data = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref,"alternateBases":$scope.alt, "start":$scope.sPos,"end":$scope.ePos};
      var url = "https://dsug72ummg.execute-api.ap-southeast-2.amazonaws.com/prod/query";

      $http({method: 'GET', url: url,params:data}).then(function successCallback(resp) {
        var hits = resp.data;
        console.log(hits);
        if( hits.exists == true){
          $scope.hits = hits.datasetAlleleResponses;
          console.log($scope.hits);
        }else{
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
