var express = require('express');
var mysql = require('mysql');

var router = express.Router();

var pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : 'aafiqtpx07kg1y.csod1um9ekbf.us-west-2.rds.amazonaws.com',
	user     : 'administrator',
	password : 'moonshine',
	database : 'moonshineDB',
    debug    :  false
});

module.exports = router;

var fullTimeEmployeeQuery = "select first_name,last_name,level,discipline,location,career_manager,email_address,full_time,skill_name,description from Employee e inner join EmployeeToSkill ets inner join Skill s where e.employee_id = ets.employee_id and s.skill_id = ets.skill_id and status ='available';"

function getAllEmployees(req,res) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        connection.query("SELECT * from Employee",function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }           
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
  });
}

function getAllEmployeesAndSkills(req,res) {
	pool.getConnection(function(err,connection){
			if (err) {
			  connection.release();
			  res.json({"code" : 100, "status" : "Error in connection database"});
			  return;
			}   

			console.log('connected as id ' + connection.threadId);
			
			connection.query(fullTimeEmployeeQuery,function(err,rows){
				connection.release();
				if(!err) {
					res.json(rows);
				}           
			});

			connection.on('error', function(err) {      
				  res.json({"code" : 100, "status" : "Error in connection database"});
				  return;     
			});
	  });
}


/* GET All Employees and Skills */
router.get('/getAllEmployeesAndSkills', function(req, res, next) {
          getAllEmployeesAndSkills(req,res);
});

/* Get All Employees */
router.get('/getAllEmployees', function(req, res, next) {
          getAllEmployees(req,res);
});

