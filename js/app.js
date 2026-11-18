//The data for the application
const filmsFrom2000s = [
    {id:4, title: 'The Incredibles', year:2004},
    {id:7, title:'Spirited Away', year:2001},
    {id:13, title: 'Mean Girls', year:2004},
    {id:18, title: 'Finding Nemo', year:2003},
    {id:25, title: 'The Dark Knight', year:2008}
];

const filmsFrom2010s = [
    {id:3, title:"Winter's Bone", year:2010},
    {id:10, title:'Gravity',year:2013},
    {id:11, title:'Arrival',year:2016},
    {id:12, title:'Wonder Woman',year:2017},
    {id:16, title:'Get Out',year:2017}
];

function changeDecade(event) {
    // Stop the default link action
    event.preventDefault();

    // Get the text inside the selected link
    const decade = event.currentTarget.textContent;
 
    updateFilmsHeading(decade);

    if(decade === "2000"){
        updateFilmList(filmsFrom2000s);
    }else if(decade === "2010"){
        updateFilmList(filmsFrom2010s);
    }
}


function updateFilmList(films) {
    //Grab holder of the 
    const filmListHolder = document.querySelector("#film-list-holder");

    // Clear existing films
    filmListHolder.innerHTML = "";

    // Create a link for each film
    films.forEach((film) => {
        //Create a hyperlink i.e. <a></a>
        const filmLink = document.createElement("a");
        //Add some text to the lin e.g. <a>Jaws</a>
        filmLink.textContent = film.title;
        //Add a href attribute e.g. <a href='films/1'>Jaws</a>
        filmLink.href = `/films/${film.id}`;
        //Create a paragraph <p></p>
        const filmLinkPara = document.createElement("p");
        //Put the link inside the paragraph e.g. <p><a href='films/1'>Jaws</a></p>
        filmLinkPara.appendChild(filmLink);
        //Put the paragraph inside <div id="film-list-holder">...<p><a href='films/1'>Jaws</a></p></div>
        filmListHolder.appendChild(filmLinkPara);
    });
}

const updateFilmsHeading = (decade) => {
    const filmHeading = document.querySelector("#films-heading");
    filmHeading.textContent = `Here's a list of films from the ${decade}s`;
}

function init() {
    const decadeLinks = document.querySelectorAll(".decade-link");
    decadeLinks.forEach((link) => {
        link.addEventListener("click", changeDecade);
    });
}

// Initialise the application by calling init()
init();
