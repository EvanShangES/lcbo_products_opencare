/**
 * Created by Evan on 2017-10-30.
 */

var lcboApp = angular.module('lcboApp', ['ngRoute']);

var lcboApiKey = "MDowZThmYzFkNi1iZTIyLTExZTctOWE1My05ZjVlZmRkY2IxMDg6NUQ0aVNQbGhsQThGRTM2WmdwSkJBZUx4cDZNRjg5bVdNT0Fh";

lcboApp.config(function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl : 'components/home/home.html',
            controller: 'mainController'
        })
});

lcboApp.controller('mainController', function($scope, $rootScope, $http, $compile){
    window.onload = function() {
        function Drink(data) {
            this.product_id = data.id;
            this.image = data.image_url;
            this.name = data.name;
            this.varietal = ((data.varietal) ? data.varietal : 'None');
            this.alcohol_content = (data.alcohol_content / 100).toFixed(1) + "% Alcohol";
            this.price = (Math.ceil(data.price_in_cents / 5) * 5 / 100).toFixed(2);
            this.package = data.package;
            this.inventory = ((data.inventory_count > 0) ? '<img src="resources/images/check.svg">In Stock' : '<img src="resources/images/x.svg">Out of Stock');
            this.release_date = ((data.released_on) ? data.released_on : "N/A");
            this.origin = data.origin;
            this.producer = data.producer_name;
            this.sugar_level = ((data.sugar_in_grams_per_liter) ? data.sugar_in_grams_per_liter + " g/L" : "N/A");
            this.sugar_content = ((data.sugar_content) ? data.sugar_content : "N/A");
            this.style = ((data.style) ? data.style : "N/A");
            this.lcboUrl = "https://www.lcbo.com/lcbo/product/" + data.name.toLowerCase().split(' ').join('-') + "/" + data.id;
        }

        function addToPage(div, drink){
            var template =  '<img src="'+drink.image+'">' +
                            '<div>' +
                                '<h1>'+drink.name+'</h1>'+
                                '<hr>'+
                                '<div class="basic-info">' +
                                    '<div class="drink-info">'+
                                        '<span class="varietal">'+drink.varietal+'</span>' +
                                        '<span class="package-alcohol">'+drink.package+'  •  '+drink.alcohol_content+'</span>' +
                                    '</div>'+
                                    '<div class="store-info">' +
                                    '<span class="price"><span class="dollar-sign">$</span> '+drink.price+'</span>' +
                                    '<span class="inventory">'+drink.inventory+'</span>' +
                                    '</div>'+
                                '</div>'+
                            '</div>';

            div.append(template);
        }

        $scope.currentProduct = null;
        $scope.productModal = null;
        $scope.drinkList = [];

        $scope.openProductPage = function(drinkId){
            console.log(drinkId);
            console.log($scope.drinkList);
            $scope.productModal = document.getElementById('productModal');
            for(var i = 0; i < $scope.drinkList.length; i++){
                if(drinkId == $scope.drinkList[i].product_id){
                    $scope.currentProduct = $scope.drinkList[i];
                    break;
                }
            }

            $scope.productModal.style.display = "block";
            console.log($scope.currentProduct);
        };

        $scope.closeProductPage = function(){
            $scope.productModal.style.display = "none";
        };

        var x = document.getElementsByClassName("product");

        var req = {
            method: 'GET',
            url: "https://lcboapi.com/products?page=13/per_page=9/",
            headers: {
                Authorization: 'Token ' + lcboApiKey
            }
        };

        $http(req).then(function (response) {
            if (response && response.data.status == 200) {
                for (var i = 0; i < response.data.result.length; i++) {
                    $scope.drinkList.push(new Drink(response.data.result[i]));

                    var productDiv = angular.element(x[i]).attr('ng-click', 'openProductPage('+response.data.result[i].id+')');
                    var content = $compile(productDiv)($scope);
                    addToPage(content, $scope.drinkList[i]);
                }
            }
        });

        $scope.refreshList = function(){
            $scope.drinkList = [];

            for(var i = 0; i < x.length; i++){
                x[i].innerHTML = "";
            }

            var randomPage = Math.floor((Math.random() * 100) + 1);

            var req = {
                method: 'GET',
                url: "https://lcboapi.com/products?page="+randomPage+"/per_page=9/",
                headers: {
                    Authorization: 'Token ' + lcboApiKey
                }
            };

            $http(req).then(function (response) {
                if (response && response.data.status == 200) {
                    for (var i = 0; i < response.data.result.length; i++) {
                        $scope.drinkList.push(new Drink(response.data.result[i]));
                        var productDiv = angular.element(x[i]).attr('ng-click', 'openProductPage('+response.data.result[i].id+')');
                        var content = $compile(productDiv)($scope);
                        addToPage(content, $scope.drinkList[i]);
                    }
                }
            });
        };

        $scope.searchProducts = function(){
            var search = document.getElementById("search").value.split(' ').join('+');

            $scope.drinkList = [];

            for(var i = 0; i < x.length; i++){
                x[i].innerHTML = "";
            }

            var req = {
                method: 'GET',
                url: "https://lcboapi.com/products?q="+search+"",
                headers: {
                    Authorization: 'Token ' + lcboApiKey
                }
            };

            $http(req).then(function (response) {
                if (response && response.data.status == 200) {
                    for (var i = 0; i < response.data.result.length; i++) {
                        $scope.drinkList.push(new Drink(response.data.result[i]));
                        var productDiv = angular.element(x[i]).attr('ng-click', 'openProductPage('+response.data.result[i].id+')');
                        var content = $compile(productDiv)($scope);
                        addToPage(content, $scope.drinkList[i]);
                    }
                }
            });
        };
    };

});