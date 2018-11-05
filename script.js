let storageCounter = 0;
let personsCounter = 0;
let persons = [];
let likes = [];
let dislikes = [];
let samePerson = false;
let lat1, lon1, lat2 = 0, lon2 = 0;
let mousePos1, mousePos2;

mapboxgl.accessToken = 'pk.eyJ1IjoiamFudGVtbWUiLCJhIjoiY2puMzUxdnl1MzZiNDNxbzhhMjZuZW8ydiJ9.VnvzvyT9kZRkmsgM_gCtdw';

let imageHammer = new Hammer(document.getElementById('imageholder'));

    function NewPerson(person, storageCounter) {
        let thisPerson = {};
        thisPerson.firstName = person.results[storageCounter].name.first;
        thisPerson.lastName = person.results[storageCounter].name.last;
        thisPerson.age = person.results[storageCounter].dob.age;
        thisPerson.area = person.results[storageCounter].location.city;
        thisPerson.profilePic = person.results[storageCounter].picture.large;
        thisPerson.userID = person.results[storageCounter].login.uuid;
        
        return thisPerson;
    }

    function loadNew(){
        fetch("https://randomuser.me/api/?results=10")
            .then(function(response) {
                return response.json();
            })
            .then(function(myJson) {
                localStorage.setItem("people", JSON.stringify(myJson));
            })
            .catch(function(error) {
                console.log('There has been a problem with your fetch operation: ', error.message);
            });

            people = JSON.parse(localStorage.getItem("people"));
            storageCounter = 0;
            console.log("10 new people arrived!");
    }

    function showProfile(){
        document.getElementById('infoholder').innerHTML = "";
        persons.forEach(person => {
            if(person.userID == people.results[storageCounter].login.uuid)
                samePerson = true;
            else
                samePerson = false;
        });

        if(!samePerson)
        {
            document.getElementById('infoholder').innerHTML = "<h2>"+ people.results[storageCounter].name.first + " " + people.results[storageCounter].name.last + ", " + people.results[storageCounter].dob.age + "</h2><h2>" + people.results[storageCounter].location.city + "</h2>";
            document.getElementById('imageholder').innerHTML = "<img src='" + people.results[storageCounter].picture.large + "' alt='profilepicture'>";
            getDistance();
            persons.push(new NewPerson(people, storageCounter));
        }
    }

    function dislike(){
        ++storageCounter;
        if(storageCounter < 9)
        {
            showProfile();
            dislikes.push(persons[personsCounter]);
            personsCounter++;
        }
        else
        {
            showProfile();
            dislikes.push(persons[personsCounter]);
            personsCounter++;
            loadNew();
        }
    }
    
    function like(){
        ++storageCounter;
        if(storageCounter < 9)
        {
            showProfile();
            likes.push(persons[personsCounter]);
            personsCounter++;
        }
        else
        {
            showProfile();
            likes.push(persons[personsCounter]);
            personsCounter++;
            loadNew();
        }
    }

    function dislikeToLike(e){
        let name = e.currentTarget.innerHTML;
        let counter = 0;

        firstAndLastName = name.split(" ");
        dislikes.forEach(person => {
            if(person.firstName == firstAndLastName[0] && person.lastName == firstAndLastName[1])
            {
                likes.push(person);
                dislikes.splice(counter, 1);
                showDislikes();
            }
            counter++;
        });
    }

    function likeToDislike(e){
        let name = e.currentTarget.innerHTML;
        let counter = 0;

        firstAndLastName = name.split(" ");
        likes.forEach(person => {
            if(person.firstName == firstAndLastName[0] && person.lastName == firstAndLastName[1])
            {
                dislikes.push(person);
                likes.splice(counter, 1);
                showLikes();
            }
            counter++;
        });
    }

    function showDislikes(){
        document.getElementById('pastPeople/map').innerHTML = "<span id='close' class='close'>&times;</span><h3>Dislikes</h3><h3>click name to like</h3>";
        dislikes.forEach(person => {
            document.getElementById('pastPeople/map').innerHTML += "<h5>" + person.firstName + " " + person.lastName + "</h5>";
        });
        document.getElementById('modal').style.display = "block";
        let names = document.getElementsByTagName('h5');
        for(let x = 0; x < names.length; x++)
        {
            names[x].addEventListener("click", dislikeToLike);
        }

        document.getElementById('close').addEventListener('click', function(){
            modal.style.display = "none";
        })

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

    function showLikes(){
        document.getElementById('pastPeople/map').innerHTML = "<span id='close' class='close'>&times;</span><h3>Likes</h3><h3>click name to dislike</h3>";
        likes.forEach(person => {
            document.getElementById('pastPeople/map').innerHTML += "<h5>" + person.firstName + " " + person.lastName + "</h5>";
        });
        document.getElementById('modal').style.display = "block";
        let names = document.getElementsByTagName('h5');
        for(let x = 0; x < names.length; x++)
        {
            names[x].addEventListener("click", likeToDislike);
        }

        document.getElementById('close').addEventListener('click', function(){
            modal.style.display = "none";
        })

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

    function toRadians(degrees){
    var pi = Math.PI;
    return degrees * (pi/180);
    }

    function getDistance(){
        lat2 = people.results[storageCounter].location.coordinates.latitude;
        lon2 = people.results[storageCounter].location.coordinates.longitude;

        let R = 6371e3; // metres
        let φ1 = toRadians(lat1);
        let φ2 = toRadians(lat2);
        let Δφ = toRadians(lat2-lat1);
        let Δλ = toRadians(lon2-lon1);

        let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        let d = R * c;

        document.getElementById('infoholder').innerHTML += "<h2 id='distance' class='distance'>" + Math.round(d) + "km away</h2>";
        document.getElementById('distance').addEventListener("click", showMap);
    }

    function getLocation(){
        if("geolocation" in navigator){
            navigator.geolocation.getCurrentPosition(function(position) {
                lat1 = position.coords.latitude;
                lon1 = position.coords.longitude;
            });
        }
        else{
            /* geolocation IS NOT available */
        }
    }

    function showMap(){
        document.getElementById('modal').style.display = "block";
        document.getElementById('pastPeople/map').innerHTML = "";
        var map = null;
        map = new mapboxgl.Map({
            container: 'pastPeople/map',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [-74.50, 40], 
            zoom: 1  
          });
        
          let latlng = [lon2, lat2];

          console.log(lat2 + lon2);
        
        var marker = new mapboxgl.Marker()
        .setLngLat(latlng)
        .addTo(map);
        
        map.flyTo({
        center: latlng,
        zoom: 11
        });

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

    function drag(e){
        mousePos1 = e.clientX;
    }

    function drop(e){
        mousePos2 = e.clientX;
        let distance = mousePos1 - mousePos2;
        if(distance > 10)
        {
            dislike();
        }
        if(distance < -10)
        {
            like();
        }
        
    }


    getLocation();
    loadNew();
    showProfile();

    document.getElementById('button--dislike').addEventListener("click", dislike);
    document.getElementById('button--like').addEventListener("click", like);
    document.getElementById('button--dislikes').addEventListener("click", showDislikes);
    document.getElementById('button--likes').addEventListener("click", showLikes);
    document.getElementById('imageholder').addEventListener('dragstart', drag, false);
    document.getElementById('imageholder').addEventListener('dragend', drop, false);
    imageHammer.on("panleft panright", function(ev) {
    drag;
    drop;
    });

    
