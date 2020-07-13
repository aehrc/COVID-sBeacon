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
      if($scope.VarType != null ){
        $scope.alt = null;
      }
      if($scope.alt != null ){
        $scope.VarType = null;
      }
      //do validation and throw error. Need to change assembly to  hCoV-19 later.
      if( $scope.sMin != null || $scope.sMax != null || $scope.eMin != null || $scope.eMax != null){
        $scope.inputText= null;
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "startMin":$scope.sMin-1,"startMax":$scope.sMax-1,"endMin":$scope.eMin-1,"endMax":$scope.eMax-1,"variantType":$scope.VarType};
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
        queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":$scope.ref.toUpperCase(),"alternateBases":$scope.alt.toUpperCase(), "start":$scope.sPos-1,"variantType":$scope.VarType};

      }
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

          $scope.loading = false;
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
