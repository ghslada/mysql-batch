const { XMLHttpRequest } = require('xhr2');
// get the client
const mysql = require('mysql2');
const { json } = require('express/lib/response');

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'convidado',
  password: '12345',
  database: 'xhrtest'
});

// simple query

const requestXHR = function () {
    return new Promise((resolve, reject) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            //    document.getElementById("demo").innerHTML = xhttp.responseText;
                // console.log(JSON.parse(this.response));
                resolve(JSON.parse(this.response));
            } else {
                if( this.readyState == 4 && this.status > 250){
                    reject(this.response);
                }
            }
        };
        xhttp.open("GET", "https://jsonplaceholder.typicode.com/comments", true);
        xhttp.send();
    });
}


const postModel = {
    "postId": '',
    "id": '',
    "name": ''
}


const adapterToDBSchema = function () {
    return new Promise((resolve, reject) => {
        let posts = [];
        requestXHR()
        .then(results => {
            
            let cont = 0;
            results.forEach(result => {
                
                let post = {...postModel};
                post.postId = result.postId;
                post.id = result.id;
                post.name = result.name;
                posts.push(post);
                cont++;
                console.log(cont+" posts adapted to db schema.");

            });
            
            resolve(posts);
        })
        .catch(err => { reject(err); } );
    });
}



const dbInsertIntoPost = function () {
  // with placeholder
  return new Promise((resolve, reject) => {
    adapterToDBSchema()
    .then(items => {
        let resultados = 0;
        connection.query(
            'INSERT INTO posts (post_id, id, name) VALUES ? as posts_i ON DUPLICATE KEY UPDATE post_id=posts_i.post_id, name=posts_i.name',
            [ items.map( item => [item.postId, item.id, item.name] ) ],
            (error, results) => {
        
                if(error) console.log (error);
                
                resolve('\nResultados: '+JSON.stringify(results)+'\n' );
                resultados = resultados + results;
                // exit();
        
            }
        );
        // connection.query(
        //     'UPDATE posts SET post_id=VALUES(post_id), name=name WHERE i',
        //     [ items.map( item => [item.postId, item.id, item.name] ) ],
        //     (error, results) => {
        
        //         if(error) reject (error);

        //         resultados = resultados + results;
        //         resolve('Resultados: '+JSON.stringify(resultados) );
        //         // exit();
        
        //     }
        // );
    })
    .catch(err => reject(err));
    
  })
}

const callDbInsertInterval = function (){


         
        setTimeout(() => {

            try {

                dbInsertIntoPost()
                .then( res => console.log(res) )
                .catch( err => {

                    console.log(err);

                    // callDbInsertInterval();

                    // clearTimeout(intervalId);
                } );

            } catch (error) {
            
                console.log(error);

                // callDbInsertInterval();
        
                // clearTimeout(intervalId);
        
            }

        }, 1000);

        const intervalId = setInterval(() => {

            try {

                dbInsertIntoPost()
                .then( res => console.log(res) )
                .catch( err => {

                    console.log(err);

                    callDbInsertInterval();

                    clearTimeout(intervalId);

                    return;

                } );

            } catch (error) {
            
                console.log(error);

                callDbInsertInterval();

                clearTimeout(intervalId);

                return;

            }

        }, 7000);




}

callDbInsertInterval();


