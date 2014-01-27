var app = angular.module('TicTacWhat', ["firebase"]);

app.controller("gameBoardCtrl", function($scope, $timeout, $firebase)
{
	$scope.gameBoard = ['A','B','C','D','E','F','G','H','I'];
	$scope.hidePlay = false;
	var playerSymbol = "";
	var newBoard = [];
	var randomBoard = [];
	var xTurn = true;
	var playerOne = [];
	var playerTwo = [];
	var gameOver = false;
	var winCombo = [[0,1,2],[3,4,5],[6,7,8],
									[0,3,6],[1,4,7],[2,5,8],
									[0,4,8],[2,4,6]
				  			 ];

	var ticTacRef;
	var IDs;

	// Generate a random board on page load
	makeNewBoard(randomBoard);
	generateBoard(randomBoard);
	var originalBoard = randomBoard;

	// Firebase init
	ticTacRef = new Firebase("https://tictacwhat.firebaseio.com/");
	$scope.fbRoot = $firebase(ticTacRef);

	// TODO: refactor
	$scope.fbRoot.$on("loaded", function() {
		$timeout(function() {

			IDs = $scope.fbRoot.$getIndex();
			if(IDs.length == 0)
			{
				// Build a board if none exist
				$scope.fbRoot.$add( {
					board: $scope.gameBoard,
					player1: playerOne,
					player2: playerTwo,
					newBoardOnline: newBoard, // Don't need?
					randomBoardOnline: randomBoard, // Change this name?
					gameOver: false,
					xTurn: true,
					statusBox: "TIC TAC WHAT???",
					seat1: {state: "Sit Down", taken: false},
					seat2: {state: "Sit Down", taken: false},
					counter: null,
					gameFull: false
				});

				$scope.fbRoot.$on("change", function() {
					IDs = $scope.fbRoot.$getIndex();
					$scope.obj = $scope.fbRoot.$child(IDs[IDs.length -1]);
				})
			}
			else
				$scope.obj = $scope.fbRoot.$child(IDs[IDs.length -1]);

			$timeout(function() {
				if($scope.obj.gameFull)
				{
					$scope.fbRoot.$add( {
						board: $scope.gameBoard,
						player1: playerOne,
						player2: playerTwo,
						newBoardOnline: newBoard, // Don't need?
						randomBoardOnline: randomBoard, // Change this name?
						gameOver: false,
						xTurn: true,
						statusBox: "TIC TAC WHAT???",
						seat1: {state: "Sit Down", taken: false},
						seat2: {state: "Sit Down", taken: false},
						counter: 10,
						gameFull: false
					});

					$scope.fbRoot.$on("change", function() {
						IDs = $scope.fbRoot.$getIndex();
						$scope.obj = $scope.fbRoot.$child(IDs[IDs.length -1]);
					})
				}
				else
					$scope.obj = $scope.fbRoot.$child(IDs[IDs.length -1]);
			}, 20)
		}, 10);
	});

	// Seat is taken when player click on "sit down"
	// TODO: refactor
	$scope.takeSeat = function(seat) {
		if (seat == 1)
		{
			$scope.obj.seat1.taken = true;
			$scope.obj.seat1.state = "Player 1";
			$scope.avatar1 = true;
		}
		else if ( seat == 2)
		{
			$scope.obj.seat2.taken = true;
			$scope.obj.seat2.state = "Player 2";
			$scope.avatar2 = true;
		}
		if ($scope.obj.seat1.taken && $scope.obj.seat2.taken)
		{
			$scope.obj.gameFull = true;

			// Start game when both seats are taken.
			$scope.hidePlay = true;
			$timeout(function(){
				makeNewBoard(newBoard);
				// generateBoard(newBoard);
				$scope.obj.board = newBoard;
				$scope.obj.$save();
			}, 10000);

			// When game starts, show countdown.
			$scope.obj.counter = 10;
			runCounter();
		}

		$scope.obj.$save();
	}

	function coolColor(color, color2, color3)
	{
		return "-webkit-gradient(linear, left top, left bottom, from("
		 + color + "), to(" + color2 + "),color-stop(0.4, " + color3 + "))";
	}

	$scope.generateColor = function(cell)
	{
		switch(cell)
		{
			case 'A':
				return coolColor('red', '#FF3333', '#FF6699');
				break;
			case 'B':
				return coolColor('#000066', '#3366CC', '#66FFFF');
				break;
			case 'C':
				return coolColor('green', '#00CC33', '#33FF33');
				break;
			case 'D':
				return coolColor('yellow', '#FFFF66', '#FFFFCC');
				break;
			case 'E':
				return coolColor('orange', '#FF9966', '#FFCC99');
				break;
			case 'F':
				return coolColor('purple', '#9900CC', '#996699');
				break;
			case 'G':
				return coolColor('pink', '#FF3399', '#FF66CC');
				break;
			case 'H':
				return coolColor('#543000', '#522F02', '#854B00');
				break;
			case 'I':
				return coolColor('#121210', '#1E1F1C', '#333332');
				break;
			case 'X':
				return '#505050';
				break;

			case 'O':
				return '#009966';
				break;
		}
	}

	function runCounter()
	{
		$scope.obj.counter -= 1;
		if ( $scope.obj.counter > 0)
			$timeout(runCounter, 1000);

		if ($scope.obj.counter == 0)
		{
			$scope.obj.counter = "Start!";
			$timeout(function() {
				$scope.obj.counter = null;
			}, 1500);
		}
	}

	// Make function to assign gameBoard's elements to its respective index
	function makeNewBoard(board) {
		var oldBoard = $scope.gameBoard.slice(0);

		for (var i = oldBoard.length; i > 0; i--)
		{
			var randChar = oldBoard[Math.floor(Math.random() * oldBoard.length)];
			board.push(randChar);
			var index = oldBoard.indexOf(randChar);

			if (index > -1)
				oldBoard.splice(index, 1);
		}
	}

	// Make function to reassign board
	function generateBoard(board)
	{
		for(var i = 0; i < board.length; i++)
		{
			var newChar = board[i];
			$scope.gameBoard[i] = newChar;
		};
	}

	// Check players' moves for win
	function winCheck(player, message)
	{
		for(var i = 0; i < winCombo.length; i++)
		{
			var winningComb = winCombo[i].filter(function(value){
				return player.indexOf(value) != -1;
			})

			if (winningComb.length == 3)
			{
				alert("Someone won... I don't care");
				$scope.obj.gameOver = true;
			}
		}
	}



	// Function to assign element's original position to player's array
	function originalPosition(player, oldCell)
	{
		var originalIndex = $scope.obj.randomBoardOnline.indexOf(oldCell);
		player.push(originalIndex);
	}

	function xIsTaken()
	{
		if ($scope.obj.board.indexOf("X") == -1)
			return true;
		else if ($scope.obj.board.indexOf("O") == -1 && playerSymbol != "X")
			return true;
		else
			return false;
	}

	function imHere()
	{
		if (playerSymbol == "X" && $scope.obj.xTurn)
			return true;
		else if (playerSymbol == "O" && $scope.obj.xTurn == false)
			return true;
	}

	// TODO: Create a function to call $scope.obj.xTurn
	$scope.attackCell = function(cell){
		// var selectedCell = $scope.gameBoard[cell];
		var selectedCell = $scope.obj.board[cell];

		if (xIsTaken() || imHere() && selectedCell != "X" && selectedCell != "O" && !$scope.obj.gameOver) {
			var oldCell = $scope.obj.board[cell];
			$scope.obj.board[cell] = $scope.obj.xTurn ? "X" : "O";
			playerSymbol = $scope.obj.xTurn ? "X" : "O";
			selectedCell = $scope.obj.board[cell];
			$scope.obj.xTurn = !$scope.obj.xTurn;

			if (selectedCell == "X")
			{
				originalPosition(playerOne, oldCell);
				$scope.obj.player1 = playerOne;
			}
			else if (selectedCell == "O")
			{
				originalPosition(playerTwo, oldCell);
				$scope.obj.player2 = playerTwo;
			}

			if ($scope.obj.player1.length > 2)
			{
				winCheck($scope.obj.player1, "Player 1 won!");
				winCheck($scope.obj.player2, "Player 2 won!");
			}
			$scope.obj.$save();
		};
	};
});


