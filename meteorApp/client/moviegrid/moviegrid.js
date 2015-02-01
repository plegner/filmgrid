var filterType = undefined;
var filterValue = undefined;
var searchString = undefined;
var sortType = undefined;

var filters = {
  "genre" : function(e) {
    if (filterType && filterValue)
    {
      if (e.genre.indexOf(filterValue) != -1)       
        return true;      
      else      
        return false;      
    }
    return true;
  }
};

var sortBy = {
  "year" : function(e) {
    return -e.year;
  },
  "stars" : function(e) {
    if (e.statusScore) 
    {
      return -e.statusScore;
    } else {
      return -e.year;
    }
  }
};

function searchTitle(e) {
  if (e.title.indexOf(searchString) != -1)
  {
    return true;
  }
  if (e.actors.indexOf(searchString) != -1)
  {
    return true;
  }
  return false;
}


function findMovies(type) {
  console.log("repainting...");
  if (Meteor.user()) {
    var query = Session.get('query');
    var scroll = Session.get('scroll');
    
    sortType     = query.sortBy;
    filterType   = query.filter.type;
    filterValue  = query.filter.value;
    searchString = Session.get('searchString'); 

    var movies = Meteor.user().profile.movies;  
    movies = _.where(movies,{statusType: type});

    if (filterType)
    {
      movies = _.filter(movies, filters[filterType]);
    }
    if (sortType)
    {
      movies = _.sortBy(movies, sortBy[sortType])
    }    
    if (searchString && searchString != "")
    {
      movies = _.filter(movies, searchTitle)
    }
    
    Session.set('moviegridLength', movies.length);

    return movies.slice(0, 30+scroll*10); // infinite scrolling client side
  }
  return null;
}

Template.moviegrid.helpers(
{
  "movies" : function() {
    switch (Session.get('type')) {
      case 'suggested' :
        return findMovies('suggested');
      case 'bookmarked' :
        return findMovies('bookmarked');
      case 'dismissed' :
        return findMovies('dismissed');
      case 'liked' :
        return findMovies('liked');
    }    
  },
  "hasMovies" : function() { return Session.get('moviegridLength') > 0;},
  "suggested" : function() { return Session.get('type') === 'suggested';}
});

Template.moviegrid.events = {
  	'click .load-more': function () {
    	  loadMore(true);
  	},
    'click .suggest-more': function () {
        loadMore(true);
        addToTheJobQueue();
    },
}

function addToTheJobQueue() {

}

// See http://www.meteorpedia.com/read/Infinite_Scrolling
function loadMore(force) {
    var $body = $('body');
    var threshold = $(window).scrollTop() + $(window).height() - $body.height();

    if (force || $body.offset().top < threshold+1 && threshold < 2) {
        var scroll = Session.get('scroll');
        scroll = scroll + 1;        
        Session.set('scroll', scroll);
    }
}

Meteor.startup(function() {
  $(window).scroll(function() { loadMore(); });

  window.$window = $(window);
  window.activeMovie = null;

  $('body').click(function() {
    if (window.activeMovie) {
      window.activeMovie.close();
    }    
  });

});

