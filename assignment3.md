## Assignment 3, CS3100 W2024, due Weds Fe 28

## Instructions

Modify the solution to your assignment 2 to use my local mongo database server instead of maintaining sections in an array. In other words, you should no longer load all the section information into an array.

If you did not complete assignment 2, you may use the codebase from another student's Assignment 2 solution; provided you have their permission and include an attribution to their work in your submission.

As with assignment 2, your server should run from the local repo with the command: 

    node app.mjs

Your sever should be available on the localhost at port 8820. 

The mongo database is called "assign3" and the collection in use to hold the sections data is called "sections".  You can reproduce my local database on your oen local server by using the mongoimport cli command with the provided data file:

    mongoimport -d="assign3" -c="sections" --type=json datas3A

To pass the unit tests, you will need the following changes to the section.mjs file:

* My representation of the section schedule will probably be different than yours, so you will have to accommodate this schedule format in the database. If you want my code for conflict checking, let me know.
* `static Section.load()` should open and return a connection to the database server, rather than read a data file. You can use the returned connection to close() the connection when you're done with the server.
* sectionObject`.add()` should add the section object to the database collection that has connected via `load()`
* you need a sectionObject`.remove()` that removes the section object from the database collection that has connected via `load()`.