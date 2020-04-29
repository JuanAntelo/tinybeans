
var app = angular.module("myApp", ["ngRoute"]);

app.constant('AppConstants', {
    baseUrl: 'http://localhost:3000/'
});

app.controller('PollResults',function($scope, $location, $http, $routeParams){
	$scope.toDashboard = function() {
		$location.url('/dashboard');
	}

	$http.post('/pollById', { ID: $routeParams.id }).then(function(res){
		var poll = res.data[0];

		$scope.question = poll.question;

		var chart = c3.generate({
		    data: {
		        columns: [
		            ['optionA : ' + poll.answerA, poll.answerACount],
		            ['optionB : ' + poll.answerB, poll.answerBCount],
		            ['optionC : ' + poll.answerC, poll.answerCCount],
		            ['optionD : ' + poll.answerD, poll.answerDCount],
		            ['optionE : ' + poll.answerE, poll.answerECount]
		        ],
		        type: 'bar'
		    },
		    bar: {
		        width: {
		            ratio: 0.5 // this makes bar width 50% of length between ticks
		        }
		        // or
		        //width: 100 // this makes bar width 100px
		    }
		});
	}, function(req, res){
		console.log('Error occured while calling pollsByUser')
	});
});

app.controller('PollDetail',function($scope, $location, $http, CurrentUser, $routeParams){
	$scope.submitPoll = function() {
		var selectedAnswer;

		if($('#optionA').is(':checked')) {
			selectedAnswer = "answerA"
		} 
		if($('#optionB').is(':checked')) {
			selectedAnswer = "answerB"
		} 
		if($('#optionC').is(':checked')) {
			selectedAnswer = "answerC"
		} 
		if($('#optionD').is(':checked')) {
			selectedAnswer = "answerD"
		} 
		if($('#optionE').is(':checked')) {
			selectedAnswer = "answerE"
		} 

		if(!selectedAnswer) {
			return;
		}

		$http.post('/submitPollAnswerById', { 
			username: CurrentUser.get(),
			ID: $routeParams.id,
			selectedAnswer: selectedAnswer
		}).then(function(res){
			$location.url('/results/' + $routeParams.id );
		}, function(req, res){
			console.log('Error occured while calling pollsByUser')
		});
	}

	$scope.back = function() {
		$location.url('/dashboard');
	}

	$http.post('/pollById', { ID: $routeParams.id }).then(function(res){
		$scope.poll = res.data[0];
	}, function(req, res){
		console.log('Error occured while calling pollsByUser')
	});
});

app.controller('CreatePoll',function($scope, $location, $http){
	$scope.createPoll = function() {
		$http.post('/createPoll', {
			"pollName":$("#pollName").val(),
			"answerA":$("#answerA").val(),
			"answerB":$("#answerB").val(),
			"answerC":$("#answerC").val(),
			"answerD":$("#answerD").val(),
			"answerE":$("#answerE").val(),
			"answerACount": 0,
			"answerBCount": 0,
			"answerCCount": 0,
			"answerDCount": 0,
			"answerECount":0
		}).then(function(){
			$location.url('/dashboard');
		}, function(){
			console.log('Error occured during CreatePoll')
		});
	}
});

app.controller('Dashboard',function($scope, $location, $http, CurrentUser) {
	$scope.availablePolls = [];
	$scope.completedPolls = [];

	$scope.goToCreatePoll = function() {
		$location.url('/admin');
	}

	$scope.navigateToPoll = function(poll) {
		$location.url('/question/' + poll.ID);
	}

	$scope.navigateToResults = function(poll) {
		$location.url('/results/' + poll.ID);
	}
	
	$scope.availablePolls = [];
	$scope.completedPolls = [];

	$http.post('/pollsByUser', {username: CurrentUser.get()}).then(function(res){
		$scope.availablePolls = res.data.availablePolls;
		$scope.completedPolls = res.data.completedPolls;
	}, function(req, res){
		console.log('Error occured while calling pollsByUser')
	});
});

app.factory('CurrentUser', function() {
	var user = "";
	return {
		set: function(username){
			user = username;
			return user;
		},
		get: function(){
			return user;
		}
	}
})

app.factory('CurrentPoll', function() {
	var pollID = "";
	return {
		set: function(poll){
			pollID = poll;
			return pollID;
		},
		get: function(){
			return pollID;
		}
	}
});

app.controller('Auth',function($scope, $location, $http, AppConstants, CurrentUser){
	$scope.error = false;

	$scope.login = function() {
		var username = $("#username").val();
		var password = $("#password").val();
		$http.post('/login', {
			'username': username,
			'password': password,
		}).then(function(res){
			if(res.data === 'empty') {
				$scope.error = true;
			} else {
				CurrentUser.set(username);
				$location.url('/dashboard');				
			}
		}, function(){
			console.log('Server error occured')
		});
	}

	$scope.goToLogin = function() {
		$location.url('/');
	}

	$scope.goToSignup = function() {
		$location.url('/signup');
	}

	$scope.signup = function() {
		$scope.error = false;
		var username = 			$("#signup-username").val();
		var password = 			$("#signup-password").val();
		var reenterPassword = 	$("#signup-reenterpassword").val();

		var validationCheck = false;
		if(username && password && reenterPassword) {
			if(password === reenterPassword) {
				validationCheck = true;
			}
		}

		if(!validationCheck) {
			$scope.error = true;
			return;
		}

		$http.post('/signup', {
			'username': username,
			'password': password
		}).then(function(response) {
			if(response !== "failed") {
				$location.url('/');
			} else {
				console.log('unable to sign up. try again')
			}
		}, function(){
			console.log('Error occured during log in')
		});
	}
})

app.config(function($routeProvider,$locationProvider) {
  $routeProvider
  .when("/", {
    templateUrl : "/templates/login.html",
    controller: 'Auth'
  })
  .when("/signup", {
    templateUrl : "/templates/signup.html",
    controller: 'Auth'
  })
  .when("/dashboard", {
    templateUrl : "/templates/main.html",
    controller: 'Dashboard'
  })
  //
  .when("/question/:id", {
    templateUrl : "/templates/polldetail.html",
    controller: 'PollDetail'
  })
  //
  .when("/results/:id", {
    templateUrl : "/templates/pollresults.html",
    controller: 'PollResults'
  })
  .when("/admin", {
    templateUrl : "/templates/create.html",
    controller: 'CreatePoll'
  });
  $locationProvider.html5Mode(true);
});
