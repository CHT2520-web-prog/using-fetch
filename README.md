# The `fetch` API

Previously, we looked at a simple JavaScript app that would allow users to browse a list of films by decade.

Users selected a decade and a list of films updated.

A major weakness of this app was the data was hard-coded into the app. 

In this practical we will externalise the data and use `fetch`  load the data. We will then integrate the JavaScript with a Laravel back-end. 

- Open your existing codespace (The one we used in the early part of the module) https://github.com/codespaces.
- In the terminal enter
```
git clone https://github.com/CHT2520-web-prog/using-fetch
```
- This will copy the contents of this repository into your codespace.

- Test the _index.html_ page in a browser. 
- This a completed version of the practical from earlier this week. You should be able to click on a decade and the list of films changes. 

## Externalising the Data as JSON. 

- Create a new folder in the project, name it _'data'_
- Create a new file in this folder, name it _2000.json_
- Paste the following JSON data into this file:

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
- Save the file
- Create another file in the same folder, name it _2010.json_
- Paste the following JSON data into this file. 

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

- In app.js add the following function at the very top of the file. See the lecture slides for an explanation of `fetch` and asynchronous JavaScript. 

```js
async function getFilms(decade) {
  const url = `./data/${decade}.json`;
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

- Modify the `changeDecade()` function to call `getFilms()` (we have deleted the `if` statement that switched between different arrays.)

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
- Test the page in a browser. 'right-click' on the page, select 'inspect', and select the 'console' tab. In the console, you should be able to view the array of films that has been loaded from a JSON file.

- Click on the decade buttons and see how the results change in the console.

- Now we have externalised the data, comment out or delete the arrays of films in _app.js_.

## Using the JSON data

- Instead of showing the results in the console, we want them to appear in the page.

- In `getFilms()` change the line:
  
```js
console.log(films);
```
- To:
```js
return films;
```
- In `changeDecade()`:
  - Declare the function as being `async`. This tells JavaScript this is a function that uses asynchronous code. 
  - Assign the films returned from `getFilms()` to a variable. Note, we use `await` as `getFilms()` returns a Promise. 
    ```js
    const films = await getFilms(decade);
    ```
  - call `updateFilmList()` to display the films in the page.
- `changeDecade()` will then look like the following:

```js
async function changeDecade(event) {
    // Stop the default link action
    event.preventDefault();
    // Get the text inside the selected link
    const decade = event.currentTarget.textContent;
    // Change the <h1> element
    updateFilmsHeading(decade);
    //call getFilms()
    const films = await getFilms(decade);
    updateFilmList(films);
}
```

- Test this in a browser. The app should work as it did before, However, now the data is being loaded from the JSON files.

## Using a Laravel back-end
We have externalised the data, but it is still hard-coded. 

It would be better if the JSON data was dynamically generated for us. 

Take your existing Laravel films CRUD app

Add a new route immediately after `Route::get('/films', [FilmController::class, 'index']);`


```php
Route::get('/films/browse', [FilmController::class, 'browse']);
```
- This route will call a `browse` method in the `FilmController`.
- In  `FilmController` add a `browse` method:

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
- This method 
    - Takes a decade from the querystring e.g. if the user visits a route such as _/films/browse?decade=2000_, `$chosenDecade` will have a value of 2000. 
    - Uses Eloquent to query the database for films that match this decade
    ```php
    Film::whereBetween('year', [$startYear, $startYear + 9])->get();
    ```
    - Passes the collection of films and a simple array of decades to a _browse_ view. 
    ```php
    return view('films.browse', ['chosenDecade' => $chosenDecade, 'decades' => $decades, 'films' => $films]);
    ```

In the _resources/views/films_ folder add a new _browse.blade.php_ view file.

```html
<x-layout title="List the films">

    <div id="decade-nav-holder">
    @foreach ($decades as $decade)
        @if ($chosenDecade === $decade)
            {{$decade}}
        @else
            <a href="/films/browse?decade={{$decade}}" class="decade-link">{{$decade}}</a>
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

- Test this works. Enter a route of _films/browse_, a list of films from the 1970s should be displayed. 
- Click on a different decade and the list of films should update.


This browse functionality is pure PHP, we **haven't** used any JavaScript.

We are following the principle of progressive enhancement i.e. building a web application with a basic, functional experience using HTML first, then enhancing JavaScript to provide richer functionality.


## Integrating with JavaScript

We will add a new route that will return JSON data that can be used by the JavaScript. 

Add the new route in _web.php_ (immediately after the route we just added).

```php
Route::get('/films/browse/{decade}', [FilmController::class, 'browseByDecade']);
```

- Add another new method to `FilmController`

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
This method:
- Accepts a query parameter e.g. for the route of `/films/browse/2010`, `$decade` will have a value of 2010. 
- Uses Eloquent to query the database for films that match this decade `Film::whereBetween('year', [$startYear, $startYear + 9])->get();`
Sends the data back as JSON. 

Test this in a browser. Enter a URL e.g. _films/browse/1970_ and you should see JSON data of films for the selected decade

Finally, we need to integrate the JavaScript. 
- Take the _app.js_ file we were working on earlier and drop this into Laravel's _public/js_ folder
- Modify _app.js_ to call a Laravel route instead of using a simple .json file. Replace the line:
```js
const url = `./data/${decade}.json`;
```
with the line
```js
const url = `/films/browse/${decade}`;
```

- Open the _browse.view.php_ file and add a link to the JavaScript file before the closing `</x-layout>` tag. 

```html
 <script src="{{asset('js/app.js')}}"></script>
```

- Test the app in the browser. 
- The app should allow the user to browse the films by decade.
Make sure you understand how this is working:
  - When the user first visits _/films/browse/_ the `browse()` method is called and the browse HTML page is generated and returned.
  - Then, when the user clicks on one of the decade links, a `fetch()` request is made, `browseByDecade()` is called  and Laravel return JSON data that JavaScript uses to change the contents of the page.

## Test Your Understanding
- In the layout file in Laravel, add a link to the browse page. Users then have two different ways of selecting films, search and browsing. 
- We have hard-coded the list of decades in the `browse()` method. How can we generate this list of decades from the database. 
