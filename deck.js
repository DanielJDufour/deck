app.controller('DeckController', ['$compile', '$scope', '$http', '$element', function($compile, $scope, $http,  $element) {
    console.log("started DeckController with scope", $scope, "and", $element);


    $scope.loading = true;

    $scope.queries = [];
    $scope.host = window.location.host;
    $scope.currentChunk = -1;
    $scope.objects = {};

    //load 10 cards at a time by default unless user has overwritten it
    $scope.loadGroupSize = $scope.$parent.deckOptions.hasOwnProperty('loadGroupSize') ? $scope.$parent.deckOptions.loadGroupSize : 10;

    $scope.htmlOfCard = $scope.$parent.deckOptions.hasOwnProperty('htmlOfCard') ? $scope.$parent.deckOptions.htmlOfCard : "<div ng-repeat='object in newobjects'>{{object}}</div>";

    $scope.search = $scope.$parent.deckOptions.hasOwnProperty('search') ? $scope.$parent.deckOptions.search : null;

    $scope.getTypeAheadOptions = function(scope_search_key, term)
    {
        scope_search_key.loading = true;
        console.log('starting getTypeAheadOptions with', scope_search_key, term);
        console.log("about to make request", scope_search_key.typeAheadUrl + term);
        return $http.get(scope_search_key.typeAheadUrl + term).then(function(response){
            scope_search_key.loading = false;
            console.log("about to return", response.data.results || response.data.result || response.data.objects);
            return response.data.results || response.data.result || response.data.objects;
        })
    }

    if ($scope.$parent.deckOptions.hasOwnProperty('queryAddress'))
    {
        $scope.queryAddress = $scope.$parent.deckOptions.queryAddress;
    }
    else
    {
        console.log("You forgot to specify $scope.queryAddress.  We won't know where to get your cards without this.")
    }


    $scope.queryFilter = ""; //defaults to blank on start up
    //looks up the params and sets the $scope.query
    $scope.setQueryFilter = function()
    {
        $scope.queryFilter = "";
        for (var key in $scope.search)
        {
            var value = $scope.search[key].value;
            if (value !== "")
            {
                $scope.queryFilter += "&"+key+$scope.search[key].query+value;
            }
        }
        console.log("$scope.queryFilter is set to", $scope.queryFilter);
    }

    $scope.getObjects = function()
    {
        $scope.loading = true;
        console.log("getting objects");
        $scope.currentChunk++;
        var limit = $scope.loadGroupSize;
        console.log("$scope.loadGroupSize is", $scope.loadGroupSize);
        console.log("$scope.currentChunk is", $scope.currentChunk);
        var offset = limit * $scope.currentChunk;
        $scope.query = $scope.queryAddress + "&limit=" + limit + '&offset=' + offset + $scope.queryFilter;
        console.log('$scope.query =', $scope.query);
        if ($scope.queries.indexOf($scope.query) === -1)
        {
            $scope.queries.push($scope.query);
            $http.get($scope.query).success(function(data){
                console.log('data is', data);
                $scope.addObjectsToDeck(data.results);
                $scope.loading = false;
            });
        }
    }

    $scope.getObjectsAfterFilter = function()
    {
        $scope.loading = true;
        console.log("getting objects");
        $scope.currentChunk++;
        var limit = $scope.loadGroupSize;
        console.log("$scope.loadGroupSize is", $scope.loadGroupSize);
        console.log("$scope.currentChunk is", $scope.currentChunk);
        var offset = limit * $scope.currentChunk;
        $scope.query = $scope.queryAddress + "&limit=" + limit + '&offset=' + offset + $scope.queryFilter;
        console.log('$scope.query =', $scope.query);
        if ($scope.queries.indexOf($scope.query) === -1)
        {
            $scope.queries.push($scope.query);
            $http.get($scope.query).success(function(data){
                console.log('data is', data);
                $scope.addObjectsToDeckAfterFilter(data.results);
                $scope.loading = false;
            });
        }
    }

    $scope.addObjectsToDeck = function(objects) {
        console.log("starting addObjectsToDeck with ", objects);
        console.log("about to add new scope");
        cardScope = $scope.$new(false, $scope);
        console.log("cardScope is", cardScope);
        cardScope.objects = objects;
        console.log("cardScope after add objects is", cardScope);
        el = angular.element($scope.htmlOfCard.replace("newobjects", "objects"));
        console.log("el is", el);
        compiled = $compile(el);
        console.log("compiled is", compiled);
        $element.append(el);
        compiled(cardScope);
        console.log("cardScope after adding is", cardScope);
    }

    $scope.filterObjects = function(){
        console.log("starting filterObjects");
        console.log("scope.search is", $scope.search);
        $scope.objects = {};

        //remove cards and their scopes
        var cards = $("bkto-mentions-card");
        for (var i = 0; i < cards.length; i++)
        {
            card = cards[i];
            cardScope = angular.element(card).scope();
            cardScope.$destroy();
            card.remove();
        }
        $scope.queries = [];
        $scope.currentChunk = -1;
        $scope.setQueryFilter();
        $scope.getObjects();
    };


    console.log("$scope.loadGroupSize is", $scope.loadGroupSize);

    window.onscroll = function (){
        console.log("starting deckOnScroll with $scope", $scope);
        if ($scope.loading)
        {
            console.log("currently loading some more objects, so no need to load more on scroll");
        }
        else
        {
            console.log("set $scope.loading to true")
            var percentage = (window.scrollY + window.document.documentElement.clientHeight/2) / window.document.documentElement.scrollHeight;
            console.log("percentage is", percentage);
            if (percentage > 0.75) {
                $scope.loading = true;
                $scope.getObjects();
            }
        }
    };

   $scope.getObjects();
}]);
