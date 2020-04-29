
Instructions : 
1) npm install
2) node server.js
3) Navigate to http://localhost:3000

How the data is structured in the database

User document : 
{
	"username": "juan",
	"password": "hashedPassword"
}

Poll document : 
{
    "ID": 3,
    "question": "fav number?",
    "answerA": "1",
    "answerB": "2",
    "answerC": "3",
    "answerD": "4",
    "answerE": "5+",
    "completedBy": [
        "new"
    ],
    "answerACount": 1,
    "answerBCount": 0,
    "answerCCount": 0,
    "answerDCount": 0,
    "answerECount": 0
}