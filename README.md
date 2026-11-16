# The `fetch` API

Previously, we looked at a simple JavaScript app that would allow users to browse a list of film by decade.

Users selected a decade and a list of films updated.

A major weakness of this app was the data was hard-coded into the app. 

## Externalisng the Data as JSON. 

Create a new folder, name 'data'
Create a new file in this folder, name it 2000.json
Paste the following JSON data into this file

```json
[
    {
        "id": 4,
        "title": "The Incredibles",
        "year": 2004
    },
    {
        "id": 7,
        "title": "Spirited Away",
        "year": 2001
    },
    {
        "id": 13,
        "title": "Mean Girls",
        "year": 2004
    },
    {
        "id": 18,
        "title": "Finding Nemo",
        "year": 2003
    },
    {
        "id": 25,
        "title": "The Dark Knight",
        "year": 2008
    }
]
```
Save the file

Create another file in the same folder, name it 2010.json
Paste in the following JSON data

```json
[
    {
        "id": 3,
        "title": "Winter's Bone",
        "year": 2010
    },
    {
        "id": 10,
        "title": "Gravity",
        "year": 2013
    },
    {
        "id": 11,
        "title": "Arrival",
        "year": 2016
    },
    {
        "id": 12,
        "title": "Wonder Woman",
        "year": 2017
    },
    {
        "id": 16,
        "title": "Get Out",
        "year": 2017
    }
]
```

In app.js add the following function

```js
async function getFilms(decade) {
  const url = "./data/" + decade + ".json";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("HTTP error: " + response.status);
    }

    const films = await response.json();
    console.log(films);

  } catch (error) {
    console.error(error.message);
  }
}
```

Modify the `changeDecade()` function to call `getFilms()` (we have deleted the `if` statement that switched between different arrays.)

```js
function changeDecade(event) {
    // Stop the default link action
    event.preventDefault();

    // Get the text inside the selected link
    const decade = event.currentTarget.textContent;
    
    // Change the <h1> element
    updateFilmsHeading(decade);

    //call getFilms()
    getFilms(decade);
}
```
Comment out the declaration of the `filmsFrom2000s` and `filmsFrom2010s` arrays

Test the page in a browser.
In a browser 'right-click' on the page, select 'inspect', and select the 'console' tab.
In the console, you should be able to view the array of films that has been loaded from a JSON file.
Click on the decade buttons and see how the results change in the console.

Still in the browser, select 'Network'
See how requests are made the .json files. 

Finally, instead of showing the results in the console, we want them to appear in the page

In getFilms() change the line
```js
console.log(films);
```
To:
```js
return films;
```
In `changeDecade()`  call updateFilmList() with the array of films returned from `getFilms()`.
changeDecade will then look like the following:-

```js
function changeDecade(event) {
    // Stop the default link action
    event.preventDefault();

    // Get the text inside the selected link
    const decade = event.currentTarget.textContent;
    
    // Change the <h1> element
    updateFilmsHeading(decade);

    //call getFilms()
    const films = getFilms(decade);
    updateFilmList(films);
}
```

Test this in a browser. The app should work as it did before, However, now the data is being loaded from the JSON files.

## Using a Laravel back-end
We have externalised the data, but it is still hard-coded. 

Even better would be if the JSON data was dynamically generated for us. 

Take your existing Laravel films CRUD app

Add a new route immediatly after `Route::get('/films', [FilmController::class, 'index']);`

```php
Route::get('/films/browse', [FilmController::class, 'browse']);

```

In the FilmController add a new method

```php
public function browse(Request $request)
    {
        $chosenDecade = (int) $request->query('decade');
        if ($chosenDecade == null) {
            $chosenDecade = 1970;
        }
        $startYear = $chosenDecade;
        $films = Film::whereBetween('year', [$startYear, $startYear + 9])->get();

        $decades = [1970, 1980, 1990, 2000, 2010, 2020];
        return view('films.browse', ['chosenDecade' => $chosenDecade, 'decades' => $decades, 'films' => $films]);
    }
```
This method 
Takes a decade from the querystring e.g. if the user visits a route such as '/films/browse?decade=2000', `$chosenDecade` will be 2000. 
Uses Eloquent to query the database for films that match this decade `Film::whereBetween('year', [$startYear, $startYear + 9])->get();`
Passes the collection of films and a simple array of decades to browse view. 

In the resources/views/films folder add a new browse.blade.php view file

```html
<x-layout title="List the films">

    <div id="decadeNavHolder">
            <a class="decade-link" href="/films/browse?decade=2000">2000</a>
            <a class="decade-link" href="/films/browse?decade=2010">2010</a>
    </div>

    @foreach ($decades as $decade)
        @if ($chosenDecade === $decade)
            {{$decade}}
        @else
            <a href="/films/browse?decade={{$decade}}">{{$decade}}</a>
        @endif
    @endforeach

        <h1 id="films-heading">Here's a list of films from the {{$chosenDecade}}s</h1>
        <div id="film-list-holder">
            @forelse ($films as $film)
                <p>
                    <a href="/films/{{$film->id}}">
                        {{$film->title}}
                    </a>
                </p>
            @empty
                <p>No films found for the {{ $chosenDecade }}s.</p>
            @endforelse
        </div>
</x-layout>
```

Test this works. Enter a route of films/browse, a list of films form the 970s should be displayed. 
Click on the various navigation options to select different decades.

This browse functionality is pure PHP, we haven't used any JavaScript yet.

We will follow the principle of progressive enhancement. 

Progressive enhancement is a web development approach in which a web application is built with a basic, functional experience using HTML first, then enhanced JavaScript to provide richer functionality.

The reason we do this is to

Prioritise core functionality: Ensure essential content and functionality work before adding enhancements.
Improve accessibility: Build on semantic HTML that assistive technologies can understand.
Improve resilience: Ensure content remains accessible if JavaScript fails, is blocked, or doesn't load correctly.
Improve performance: Avoid unnecessarily relying on JavaScript for functionality that HTML and CSS can provide.

## Integrating with JavaScript

We will add a new route that will return JSON data that can be used by the JavaScript. 

Add the new route in web.php
```php
Route::get('/films/browse', [FilmController::class, 'browse']);
```

Add it immediately after the route we just added. 

Add another new method to filmController

```php
    public function browseByDecade(int $decade)
    {
        $startYear = $decade;
        $films = Film::whereBetween('year', [
            $startYear,
            $startYear + 9
        ])->get();
        return response()->json($films);
    }
```
This method accepts a query parameter e.g. for the route of `/films/browse/2010`, `$decade` will have a value of 2010. 
Uses Eloquent to query the database for films that match this decade `Film::whereBetween('year', [$startYear, $startYear + 9])->get();`
Sends the data back as JSON. 

test this in a browser. Enter a URL e.g. films/browse/1970 and you should see JSON data of films for the selected decade



Take the app.js file we were working on earlier and drop this into the public/js folder

Modify app.js to call a Laravel route instead of a simpel.json file

replace the line
```js
const url = `./data/${decade}.json`;
```
with the line
```js
const url = `/films/browse/${decade}`;
```

Open the browse.view.php file and add a link to the JavaScript file before the closing `</x-layout>` tag. 

```
 <script src="{{asset('js/app.js')}}"></script>
```

Test the app in the browser. 
Use the developer tools
Make sure you understand how this is working
When the user first clicks browse the browser method is called and the browse HTML page is generated and returned
Then when the user clicks on one of the decade links, a fetch() request is made, browserByDecade is called  and Laravel return JSON data that JavaScript uses to change the contents of the page.

Note we only had to change one line of code in JavaScript to get this to work with a laravel back-end. 

preventDefault. 
